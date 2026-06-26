import { and, eq } from "drizzle-orm";
import { getDb } from "@afterhive/db";
import { relationships } from "@afterhive/db/schema";
import type { PortalSessionContext } from "../auth/get-portal-session";

export async function resolvePortalDocumentPersonIds(
  session: PortalSessionContext,
): Promise<string[]> {
  if (!session.tenantId) {
    return [];
  }

  const db = getDb();
  const childRows = await db
    .select({ personId: relationships.toPersonId })
    .from(relationships)
    .where(
      and(
        eq(relationships.tenantId, session.tenantId),
        eq(relationships.fromPersonId, session.personId),
        eq(relationships.type, "guardian"),
      ),
    );

  return [session.personId, ...childRows.map((row) => row.personId)];
}
