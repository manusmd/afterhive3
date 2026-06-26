const TENANT_CREATORS = new Set(["platform_superadmin"]);

export function canCreateTenant(roles: string[]) {
  return roles.some((role) => TENANT_CREATORS.has(role));
}
