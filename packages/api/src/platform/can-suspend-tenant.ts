const TENANT_SUSPENDERS = new Set(["platform_superadmin"]);

export function canSuspendTenant(roles: string[]) {
  return roles.some((role) => TENANT_SUSPENDERS.has(role));
}
