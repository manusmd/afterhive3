import { and, eq } from "drizzle-orm";
import { getDb } from "@afterhive/db";
import { roleAssignments, tenantMemberships, tenants } from "@afterhive/db/schema";
import type { SessionContext } from "@afterhive/domain";

export async function resolveStaffSession(
  userId: string,
  tenantSlug: string,
): Promise<SessionContext | null> {
  const db = getDb();

  const [row] = await db
    .select({
      tenantId: tenants.id,
      tenantSlug: tenants.slug,
      tenantStatus: tenants.status,
      membershipId: tenantMemberships.id,
    })
    .from(tenantMemberships)
    .innerJoin(tenants, eq(tenantMemberships.tenantId, tenants.id))
    .where(
      and(
        eq(tenants.slug, tenantSlug),
        eq(tenantMemberships.userId, userId),
        eq(tenantMemberships.status, "active"),
      ),
    )
    .limit(1);

  if (!row || row.tenantStatus === "suspended" || row.tenantStatus === "closed") {
    return null;
  }

  const roles = await db
    .select()
    .from(roleAssignments)
    .where(eq(roleAssignments.membershipId, row.membershipId));

  const roleNames = roles.map((entry) => entry.role);
  const hasAllLocations = roles.some(
    (entry) => !entry.locationIds || entry.locationIds.length === 0,
  );
  const locationIds = hasAllLocations
    ? undefined
    : [...new Set(roles.flatMap((entry) => entry.locationIds ?? []))];

  return {
    userId,
    surface: "tenant_admin",
    tenantId: row.tenantId,
    tenantSlug: row.tenantSlug,
    roles: roleNames,
    locationIds,
  };
}
