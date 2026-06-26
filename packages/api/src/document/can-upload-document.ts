const UPLOAD_DOCUMENT_ROLES = new Set(["tenant_owner", "tenant_admin"]);

export function canUploadDocument(roles: string[]) {
  return roles.some((role) => UPLOAD_DOCUMENT_ROLES.has(role));
}
