import { eq } from "drizzle-orm";
import { getDb } from "@afterhive/db";
import { tenants } from "@afterhive/db/schema";

export const CLUB_SPORT_MODULE = "club_sport";

export function tenantModulesIncludeClubSport(modules: string[]) {
  return modules.includes(CLUB_SPORT_MODULE);
}

export async function loadTenantModules(tenantId: string): Promise<string[]> {
  const db = getDb();
  const [row] = await db
    .select({ modules: tenants.modules })
    .from(tenants)
    .where(eq(tenants.id, tenantId))
    .limit(1);

  return row?.modules ?? [];
}

export async function tenantHasClubSportModule(tenantId: string): Promise<boolean> {
  const modules = await loadTenantModules(tenantId);
  return tenantModulesIncludeClubSport(modules);
}
