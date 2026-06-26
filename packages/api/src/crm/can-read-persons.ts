const PERSON_READ_ROLES = new Set([
  "tenant_owner",
  "tenant_admin",
  "tenant_office",
  "tenant_coach",
  "tenant_finance",
  "tenant_location_manager",
]);

export function canReadPersons(roles: string[]) {
  return roles.some((role) => PERSON_READ_ROLES.has(role));
}
