const INVITE_ROLE_ASSIGNERS = new Set(["tenant_owner", "tenant_admin"]);

export function canAssignRoles(roles: string[]) {
  return roles.some((role) => INVITE_ROLE_ASSIGNERS.has(role));
}
