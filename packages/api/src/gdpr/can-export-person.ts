import {
  hasAllLocationsByDefault,
  requiresAssignedLocations,
} from "../location/role-location-scope";

const EXPORT_PERSON_ROLES = new Set([
  "tenant_owner",
  "tenant_admin",
  "tenant_office",
  "tenant_location_manager",
]);

export function canExportPerson(roles: string[], locationIds?: string[]) {
  if (!roles.some((role) => EXPORT_PERSON_ROLES.has(role))) {
    return false;
  }

  if (roles.some((role) => hasAllLocationsByDefault(role))) {
    return true;
  }

  if (roles.some((role) => requiresAssignedLocations(role) && EXPORT_PERSON_ROLES.has(role))) {
    return (locationIds?.length ?? 0) > 0;
  }

  return true;
}
