const CREATE_OFFER_ROLES = new Set(["tenant_owner", "tenant_admin"]);

export function canCreateOffer(roles: string[]) {
  return roles.some((role) => CREATE_OFFER_ROLES.has(role));
}
