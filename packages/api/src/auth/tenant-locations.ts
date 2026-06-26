import { eq } from "drizzle-orm";
import { getDb } from "@afterhive/db";
import { locations, tenants } from "@afterhive/db/schema";

export async function listTenantLocations(tenantSlug: string) {
  const db = getDb();

  const [tenant] = await db
    .select({ id: tenants.id })
    .from(tenants)
    .where(eq(tenants.slug, tenantSlug))
    .limit(1);

  if (!tenant) {
    return [];
  }

  return db
    .select({ id: locations.id, name: locations.name })
    .from(locations)
    .where(eq(locations.tenantId, tenant.id));
}
