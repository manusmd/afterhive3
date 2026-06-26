const LEAD_READERS = new Set([
  "tenant_owner",
  "tenant_admin",
  "tenant_office",
  "tenant_finance",
  "tenant_location_manager",
]);

export function canReadLeads(roles: string[]) {
  return roles.some((role) => LEAD_READERS.has(role));
}
