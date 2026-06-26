import { and, eq } from "drizzle-orm";
import { getDb } from "@afterhive/db";
import { auditLogEntries, documents, tenants } from "@afterhive/db/schema";
import type { PortalSessionContext } from "../auth/get-portal-session";
import { canReadPortalDocuments } from "./can-read-portal-documents";
import { canPortalUserAccessDocument } from "./is-portal-visible-document";
import { getDocumentStorage } from "./r2-storage";
import { resolvePortalDocumentPersonIds } from "./resolve-portal-document-person-ids";

const SIGNED_URL_TTL_SECONDS = 15 * 60;

export type GetDocumentSignedUrlResult = {
  url: string;
  filename: string;
  expiresInSeconds: number;
};

export class GetDocumentSignedUrlError extends Error {
  constructor(
    readonly code: "tenant_not_found" | "document_not_found" | "forbidden",
  ) {
    super(code);
    this.name = "GetDocumentSignedUrlError";
  }
}

export async function getDocumentSignedUrl(
  session: PortalSessionContext,
  tenantSlug: string,
  documentId: string,
): Promise<GetDocumentSignedUrlResult> {
  if (!session.tenantId || !session.userId) {
    throw new GetDocumentSignedUrlError("tenant_not_found");
  }

  if (!canReadPortalDocuments(session.roles)) {
    throw new GetDocumentSignedUrlError("forbidden");
  }

  const db = getDb();
  const [tenant] = await db
    .select({ id: tenants.id })
    .from(tenants)
    .where(and(eq(tenants.id, session.tenantId), eq(tenants.slug, tenantSlug)))
    .limit(1);

  if (!tenant) {
    throw new GetDocumentSignedUrlError("tenant_not_found");
  }

  const [document] = await db
    .select({
      id: documents.id,
      tenantId: documents.tenantId,
      storageKey: documents.storageKey,
      filename: documents.filename,
      visibility: documents.visibility,
      deletedAt: documents.deletedAt,
      linkedEntityType: documents.linkedEntityType,
      linkedEntityId: documents.linkedEntityId,
    })
    .from(documents)
    .where(and(eq(documents.id, documentId), eq(documents.tenantId, session.tenantId)))
    .limit(1);

  if (!document) {
    throw new GetDocumentSignedUrlError("document_not_found");
  }

  const accessiblePersonIds = await resolvePortalDocumentPersonIds(session);

  if (
    !canPortalUserAccessDocument(
      {
        visibility: document.visibility,
        deletedAt: document.deletedAt,
        linkedEntityType: document.linkedEntityType,
        linkedEntityId: document.linkedEntityId,
      },
      accessiblePersonIds,
    )
  ) {
    throw new GetDocumentSignedUrlError("forbidden");
  }

  let url: string;

  try {
    url = await getDocumentStorage().getSignedUrl({
      key: document.storageKey,
      expiresInSeconds: SIGNED_URL_TTL_SECONDS,
    });
  } catch {
    throw new GetDocumentSignedUrlError("document_not_found");
  }

  await db.insert(auditLogEntries).values({
    tenantId: session.tenantId,
    actorUserId: session.userId,
    action: "document.download",
    entityType: "document",
    entityId: document.id,
    after: {
      filename: document.filename,
      visibility: document.visibility,
    },
  });

  return {
    url,
    filename: document.filename,
    expiresInSeconds: SIGNED_URL_TTL_SECONDS,
  };
}
