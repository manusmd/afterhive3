import { and, eq, isNull } from "drizzle-orm";
import { getDb } from "@afterhive/db";
import { persons, tenants } from "@afterhive/db/schema";
import type { SessionContext } from "@afterhive/domain";
import { getPortalAuth } from "./portal-auth";

export type PortalSessionContext = SessionContext & {
  personId: string;
};

export async function resolvePortalSession(
  userId: string,
  tenantSlug: string,
): Promise<PortalSessionContext | null> {
  const db = getDb();

  const [row] = await db
    .select({
      tenantId: tenants.id,
      tenantSlug: tenants.slug,
      tenantStatus: tenants.status,
      personId: persons.id,
    })
    .from(persons)
    .innerJoin(tenants, eq(persons.tenantId, tenants.id))
    .where(
      and(
        eq(tenants.slug, tenantSlug),
        eq(persons.userId, userId),
        isNull(persons.deletedAt),
      ),
    )
    .limit(1);

  if (!row || row.tenantStatus === "suspended" || row.tenantStatus === "closed") {
    return null;
  }

  return {
    userId,
    surface: "portal",
    tenantId: row.tenantId,
    tenantSlug: row.tenantSlug,
    roles: ["portal_parent"],
    personId: row.personId,
  };
}

export async function getPortalSessionContext(
  tenantSlug: string,
  requestHeaders: Headers,
): Promise<PortalSessionContext | null> {
  const auth = getPortalAuth();
  const session = await auth.api.getSession({
    headers: requestHeaders,
  });

  if (!session?.user) {
    return null;
  }

  return resolvePortalSession(session.user.id, tenantSlug);
}
