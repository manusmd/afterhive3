import { eq } from "drizzle-orm";
import { getDb } from "@afterhive/db";
import { tenants } from "@afterhive/db/schema";

export async function getTenantDisplayName(tenantSlug: string) {
  const [row] = await getDb()
    .select({ name: tenants.name })
    .from(tenants)
    .where(eq(tenants.slug, tenantSlug))
    .limit(1);

  return row?.name ?? tenantSlug;
}
