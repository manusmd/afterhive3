import { inArray, sql, type SQL } from "drizzle-orm";
import type { AnyPgColumn } from "drizzle-orm/pg-core";

export function hasAllLocationsAccess(locationIds?: string[]): boolean {
  return locationIds === undefined;
}

export function hasNoLocationAccess(locationIds?: string[]): boolean {
  return locationIds !== undefined && locationIds.length === 0;
}

export function buildLocationScopeFilter(
  locationColumn: AnyPgColumn,
  locationIds?: string[],
): SQL | undefined {
  if (hasAllLocationsAccess(locationIds)) {
    return undefined;
  }

  if (hasNoLocationAccess(locationIds)) {
    return sql`false`;
  }

  const scopedIds = locationIds ?? [];
  return inArray(locationColumn, scopedIds);
}

export function isWithinLocationScope(
  resourceLocationId: string,
  locationIds?: string[],
): boolean {
  if (hasAllLocationsAccess(locationIds)) {
    return true;
  }

  if (hasNoLocationAccess(locationIds)) {
    return false;
  }

  const scopedIds = locationIds ?? [];
  return scopedIds.includes(resourceLocationId);
}
