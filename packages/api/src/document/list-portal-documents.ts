import { and, eq, inArray, isNull, or } from "drizzle-orm";
import { getDb } from "@afterhive/db";
import { documents, tenants } from "@afterhive/db/schema";
import type { PortalSessionContext } from "../auth/get-portal-session";
import { canReadPortalDocuments } from "./can-read-portal-documents";
import { resolvePortalDocumentPersonIds } from "./resolve-portal-document-person-ids";

export type PortalDocumentListItem = {
  documentId: string;
  filename: string;
  mimeType: string;
  sizeBytes: number;
  visibility: "portal" | "both";
  createdAt: string;
};

export async function listPortalDocuments(
  session: PortalSessionContext,
  tenantSlug: string,
): Promise<PortalDocumentListItem[]> {
  if (!session.tenantId || !canReadPortalDocuments(session.roles)) {
    return [];
  }

  const db = getDb();
  const [tenant] = await db
    .select({ id: tenants.id })
    .from(tenants)
    .where(and(eq(tenants.id, session.tenantId), eq(tenants.slug, tenantSlug)))
    .limit(1);

  if (!tenant) {
    return [];
  }

  const accessiblePersonIds = await resolvePortalDocumentPersonIds(session);

  const rows = await db
    .select({
      id: documents.id,
      filename: documents.filename,
      mimeType: documents.mimeType,
      sizeBytes: documents.sizeBytes,
      visibility: documents.visibility,
      linkedEntityType: documents.linkedEntityType,
      linkedEntityId: documents.linkedEntityId,
      createdAt: documents.createdAt,
    })
    .from(documents)
    .where(
      and(
        eq(documents.tenantId, session.tenantId),
        isNull(documents.deletedAt),
        inArray(documents.visibility, ["portal", "both"]),
        or(
          isNull(documents.linkedEntityId),
          and(
            eq(documents.linkedEntityType, "person"),
            inArray(documents.linkedEntityId, accessiblePersonIds),
          ),
        ),
      ),
    );

  return rows.map((row) => ({
    documentId: row.id,
    filename: row.filename,
    mimeType: row.mimeType,
    sizeBytes: row.sizeBytes,
    visibility: row.visibility as "portal" | "both",
    createdAt: row.createdAt.toISOString(),
  }));
}
