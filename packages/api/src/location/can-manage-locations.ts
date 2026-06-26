const LOCATION_VIEWERS = new Set([
  "tenant_owner",
  "tenant_admin",
  "tenant_location_manager",
]);

const LOCATION_CREATORS = new Set(["tenant_owner", "tenant_admin"]);

export function canViewLocations(roles: string[]) {
  return roles.some((role) => LOCATION_VIEWERS.has(role));
}

export function canCreateLocation(roles: string[]) {
  return roles.some((role) => LOCATION_CREATORS.has(role));
}
