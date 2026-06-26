import {
  hasAllLocationsByDefault,
  requiresAssignedLocations,
} from "../location/role-location-scope";

const LEAD_CREATORS = new Set([
  "tenant_owner",
  "tenant_admin",
  "tenant_office",
  "tenant_location_manager",
]);

export function canCreateLead(roles: string[], locationIds?: string[]) {
  if (!roles.some((role) => LEAD_CREATORS.has(role))) {
    return false;
  }

  if (roles.some((role) => hasAllLocationsByDefault(role))) {
    return true;
  }

  if (roles.some((role) => requiresAssignedLocations(role) && LEAD_CREATORS.has(role))) {
    return (locationIds?.length ?? 0) > 0;
  }

  return true;
}
