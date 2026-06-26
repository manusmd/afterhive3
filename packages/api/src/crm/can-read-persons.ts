import {
  hasAllLocationsByDefault,
  requiresAssignedLocations,
} from "../location/role-location-scope";

const PERSON_READERS = new Set([
  "tenant_owner",
  "tenant_admin",
  "tenant_office",
  "tenant_finance",
  "tenant_location_manager",
]);

export function canReadPersons(roles: string[], locationIds?: string[]) {
  if (!roles.some((role) => PERSON_READERS.has(role))) {
    return false;
  }

  if (roles.some((role) => hasAllLocationsByDefault(role))) {
    return true;
  }

  if (roles.some((role) => requiresAssignedLocations(role) && PERSON_READERS.has(role))) {
    return (locationIds?.length ?? 0) > 0;
  }

  return true;
}
