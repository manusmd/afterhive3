import { and, desc, eq } from "drizzle-orm";
import { getDb } from "@afterhive/db";
import { leads, locations } from "@afterhive/db/schema";
import type { SessionContext } from "@afterhive/domain";
import {
  buildLocationScopeFilter,
  hasNoLocationAccess,
} from "../location/location-scope";

export type LeadListItem = {
  id: string;
  firstName: string;
  lastName: string;
  status: string;
  source: string;
  locationId: string;
  locationName: string;
  lastActivityAt: string;
};

export function resolveListLeadsLocationScope(
  locationIds?: string[],
): string[] | undefined {
  return locationIds;
}

export async function listLeads(session: SessionContext): Promise<LeadListItem[]> {
  if (!session.tenantId || hasNoLocationAccess(session.locationIds)) {
    return [];
  }

  const db = getDb();
  const conditions = [eq(leads.tenantId, session.tenantId)];
  const scopeFilter = buildLocationScopeFilter(
    leads.locationId,
    resolveListLeadsLocationScope(session.locationIds),
  );

  if (scopeFilter) {
    conditions.push(scopeFilter);
  }

  const rows = await db
    .select({
      id: leads.id,
      firstName: leads.firstName,
      lastName: leads.lastName,
      status: leads.status,
      source: leads.source,
      locationId: leads.locationId,
      locationName: locations.name,
      lastActivityAt: leads.lastActivityAt,
    })
    .from(leads)
    .innerJoin(locations, eq(leads.locationId, locations.id))
    .where(and(...conditions))
    .orderBy(desc(leads.lastActivityAt));

  return rows.map((row) => ({
    id: row.id,
    firstName: row.firstName,
    lastName: row.lastName,
    status: row.status,
    source: row.source,
    locationId: row.locationId,
    locationName: row.locationName,
    lastActivityAt: row.lastActivityAt.toISOString(),
  }));
}
