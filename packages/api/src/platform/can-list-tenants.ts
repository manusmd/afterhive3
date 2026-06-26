const TENANT_LIST_VIEWERS = new Set([
  "platform_superadmin",
  "platform_support",
  "platform_finance",
]);

export function canListTenants(roles: string[]) {
  return roles.some((role) => TENANT_LIST_VIEWERS.has(role));
}
