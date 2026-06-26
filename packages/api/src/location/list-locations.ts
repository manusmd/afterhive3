import { eq } from "drizzle-orm";
import { getDb } from "@afterhive/db";
import { locations, tenants } from "@afterhive/db/schema";

export type LocationListItem = {
  id: string;
  name: string;
  createdAt: string;
};

export async function listLocations(tenantSlug: string): Promise<LocationListItem[]> {
  const db = getDb();

  const [tenant] = await db
    .select({ id: tenants.id })
    .from(tenants)
    .where(eq(tenants.slug, tenantSlug))
    .limit(1);

  if (!tenant) {
    return [];
  }

  const rows = await db
    .select({
      id: locations.id,
      name: locations.name,
      createdAt: locations.createdAt,
    })
    .from(locations)
    .where(eq(locations.tenantId, tenant.id));

  return rows.map((row) => ({
    id: row.id,
    name: row.name,
    createdAt: row.createdAt.toISOString(),
  }));
}
