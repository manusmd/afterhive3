const MERGE_PERSON_ROLES = new Set(["tenant_owner", "tenant_admin"]);

export function canMergePersons(roles: string[]) {
  return roles.some((role) => MERGE_PERSON_ROLES.has(role));
}
