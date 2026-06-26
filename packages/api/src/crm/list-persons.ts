import { and, desc, eq, isNull } from "drizzle-orm";
import { getDb } from "@afterhive/db";
import { leads, persons } from "@afterhive/db/schema";
import type { SessionContext } from "@afterhive/domain";
import {
  buildLocationScopeFilter,
  hasAllLocationsAccess,
  hasNoLocationAccess,
} from "../location/location-scope";

export type PersonListItem = {
  id: string;
  firstName: string;
  lastName: string;
  createdAt: string;
};

export function resolveListPersonsLocationScope(
  locationIds?: string[],
): string[] | undefined {
  return locationIds;
}

export async function listPersons(session: SessionContext): Promise<PersonListItem[]> {
  if (!session.tenantId || hasNoLocationAccess(session.locationIds)) {
    return [];
  }

  const db = getDb();
  const baseConditions = [eq(persons.tenantId, session.tenantId), isNull(persons.deletedAt)];

  if (hasAllLocationsAccess(session.locationIds)) {
    const rows = await db
      .select({
        id: persons.id,
        firstName: persons.firstName,
        lastName: persons.lastName,
        createdAt: persons.createdAt,
      })
      .from(persons)
      .where(and(...baseConditions))
      .orderBy(desc(persons.createdAt));

    return rows.map((row) => ({
      id: row.id,
      firstName: row.firstName,
      lastName: row.lastName,
      createdAt: row.createdAt.toISOString(),
    }));
  }

  const scopeFilter = buildLocationScopeFilter(
    leads.locationId,
    resolveListPersonsLocationScope(session.locationIds),
  );
  const conditions = [...baseConditions];

  if (scopeFilter) {
    conditions.push(scopeFilter);
  }

  const rows = await db
    .selectDistinct({
      id: persons.id,
      firstName: persons.firstName,
      lastName: persons.lastName,
      createdAt: persons.createdAt,
    })
    .from(persons)
    .innerJoin(leads, eq(leads.convertedPersonId, persons.id))
    .where(and(...conditions))
    .orderBy(desc(persons.createdAt));

  return rows.map((row) => ({
    id: row.id,
    firstName: row.firstName,
    lastName: row.lastName,
    createdAt: row.createdAt.toISOString(),
  }));
}
