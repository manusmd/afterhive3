const ANONYMIZE_PERSON_ROLES = new Set(["tenant_owner", "tenant_admin"]);

export function canAnonymizePerson(roles: string[]) {
  return roles.some((role) => ANONYMIZE_PERSON_ROLES.has(role));
}
