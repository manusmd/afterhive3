import { createHash, randomUUID } from "node:crypto";
import { and, eq } from "drizzle-orm";
import { getDb } from "@afterhive/db";
import { documents, tenants } from "@afterhive/db/schema";
import type { SessionContext } from "@afterhive/domain";
import {
  DOCUMENT_MAX_BYTES,
  isAllowedDocumentMimeType,
  type DocumentVisibility,
} from "@afterhive/shared";
import { buildDocumentStorageKey, sanitizeDocumentFilename } from "./build-storage-key";
import { getDocumentStorage } from "./r2-storage";

export type UploadDocumentInput = {
  filename: string;
  mimeType: string;
  body: Buffer;
  visibility?: DocumentVisibility;
};

export type UploadDocumentResult = {
  documentId: string;
  storageKey: string;
  filename: string;
  mimeType: string;
  sizeBytes: number;
  sha256: string;
  visibility: DocumentVisibility;
  createdAt: string;
};

export class UploadDocumentError extends Error {
  constructor(
    readonly code:
      | "tenant_not_found"
      | "invalid_file"
      | "file_too_large"
      | "mime_not_allowed"
      | "storage_failed",
  ) {
    super(code);
    this.name = "UploadDocumentError";
  }
}

export async function uploadDocument(
  session: SessionContext,
  tenantSlug: string,
  input: UploadDocumentInput,
): Promise<UploadDocumentResult> {
  if (!session.tenantId || !session.userId) {
    throw new UploadDocumentError("tenant_not_found");
  }

  if (!input.filename.trim() || input.body.byteLength === 0) {
    throw new UploadDocumentError("invalid_file");
  }

  if (input.body.byteLength > DOCUMENT_MAX_BYTES) {
    throw new UploadDocumentError("file_too_large");
  }

  if (!isAllowedDocumentMimeType(input.mimeType)) {
    throw new UploadDocumentError("mime_not_allowed");
  }

  const db = getDb();
  const [tenant] = await db
    .select({ id: tenants.id })
    .from(tenants)
    .where(and(eq(tenants.id, session.tenantId), eq(tenants.slug, tenantSlug)))
    .limit(1);

  if (!tenant) {
    throw new UploadDocumentError("tenant_not_found");
  }

  const documentId = randomUUID();
  const storageKey = buildDocumentStorageKey(session.tenantId, documentId, input.filename);
  const sha256 = createHash("sha256").update(input.body).digest("hex");
  const visibility = input.visibility ?? "internal";

  try {
    await getDocumentStorage().putObject({
      key: storageKey,
      body: input.body,
      contentType: input.mimeType,
    });
  } catch {
    throw new UploadDocumentError("storage_failed");
  }

  const [document] = await db
    .insert(documents)
    .values({
      id: documentId,
      tenantId: session.tenantId,
      storageKey,
      filename: sanitizeDocumentFilename(input.filename),
      mimeType: input.mimeType,
      sizeBytes: input.body.byteLength,
      sha256,
      visibility,
      uploadedByUserId: session.userId,
    })
    .returning({
      id: documents.id,
      storageKey: documents.storageKey,
      filename: documents.filename,
      mimeType: documents.mimeType,
      sizeBytes: documents.sizeBytes,
      sha256: documents.sha256,
      visibility: documents.visibility,
      createdAt: documents.createdAt,
    });

  if (!document) {
    throw new UploadDocumentError("storage_failed");
  }

  return {
    documentId: document.id,
    storageKey: document.storageKey,
    filename: document.filename,
    mimeType: document.mimeType,
    sizeBytes: document.sizeBytes,
    sha256: document.sha256,
    visibility: document.visibility,
    createdAt: document.createdAt.toISOString(),
  };
}
