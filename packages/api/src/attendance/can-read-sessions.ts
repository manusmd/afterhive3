import {
  hasAllLocationsByDefault,
  requiresAssignedLocations,
} from "../location/role-location-scope";

const SESSION_READERS = new Set([
  "tenant_owner",
  "tenant_admin",
  "tenant_office",
  "tenant_coach",
  "tenant_location_manager",
]);

export function canReadSessions(roles: string[], locationIds?: string[]) {
  if (!roles.some((role) => SESSION_READERS.has(role))) {
    return false;
  }

  if (roles.some((role) => hasAllLocationsByDefault(role))) {
    return true;
  }

  if (roles.some((role) => requiresAssignedLocations(role) && SESSION_READERS.has(role))) {
    return (locationIds?.length ?? 0) > 0;
  }

  return true;
}
