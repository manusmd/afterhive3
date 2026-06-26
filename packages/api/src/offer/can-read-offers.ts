import {
  hasAllLocationsByDefault,
  requiresAssignedLocations,
} from "../location/role-location-scope";

const OFFER_READERS = new Set([
  "tenant_owner",
  "tenant_admin",
  "tenant_office",
  "tenant_coach",
  "tenant_finance",
  "tenant_location_manager",
]);

export function canReadOffers(roles: string[], locationIds?: string[]) {
  if (!roles.some((role) => OFFER_READERS.has(role))) {
    return false;
  }

  if (roles.some((role) => hasAllLocationsByDefault(role))) {
    return true;
  }

  if (roles.some((role) => requiresAssignedLocations(role) && OFFER_READERS.has(role))) {
    return (locationIds?.length ?? 0) > 0;
  }

  return true;
}
