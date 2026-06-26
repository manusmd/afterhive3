const PORTAL_DOCUMENT_READ_ROLES = new Set(["portal_parent"]);

export function canReadPortalDocuments(roles: string[]) {
  return roles.some((role) => PORTAL_DOCUMENT_READ_ROLES.has(role));
}
