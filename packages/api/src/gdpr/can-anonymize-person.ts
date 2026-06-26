import type { SessionContext } from "@afterhive/domain";
import {
  requiresAssignedLocations,
  type RoleAssignmentLocation,
} from "../location/role-location-scope";

const ANONYMIZE_PERSON_ROLES = new Set(["tenant_owner", "tenant_admin"]);

const UNRESTRICTED_ANONYMIZE_ROLES = new Set(["tenant_owner", "tenant_admin"]);

export function resolveAnonymizeLocationIds(
  roles: string[],
  assignments: RoleAssignmentLocation[],
): string[] | undefined {
  const anonymizeAssignments = assignments.filter((entry) =>
    ANONYMIZE_PERSON_ROLES.has(entry.role),
  );

  const hasUnrestrictedAnonymize = anonymizeAssignments.some(
    (entry) =>
      UNRESTRICTED_ANONYMIZE_ROLES.has(entry.role) &&
      (!entry.locationIds || entry.locationIds.length === 0),
  );

  if (hasUnrestrictedAnonymize) {
    return undefined;
  }

  const scopedIds = anonymizeAssignments.flatMap((entry) => {
    const ids = entry.locationIds ?? [];

    if (UNRESTRICTED_ANONYMIZE_ROLES.has(entry.role) && ids.length > 0) {
      return ids;
    }

    return [];
  });

  return [...new Set(scopedIds)];
}

export function resolveSessionAnonymizeLocationIds(session: SessionContext): string[] | undefined {
  if (session.roleAssignments) {
    return resolveAnonymizeLocationIds(session.roles, session.roleAssignments);
  }

  if (session.roles.some((role) => UNRESTRICTED_ANONYMIZE_ROLES.has(role))) {
    return undefined;
  }

  return session.locationIds;
}

export function canAnonymizePerson(
  roles: string[],
  locationIds?: string[],
  assignments?: RoleAssignmentLocation[],
) {
  if (!roles.some((role) => ANONYMIZE_PERSON_ROLES.has(role))) {
    return false;
  }

  if (assignments) {
    const anonymizeScope = resolveAnonymizeLocationIds(roles, assignments);
    if (anonymizeScope === undefined) {
      return true;
    }
    return anonymizeScope.length > 0;
  }

  if (roles.some((role) => UNRESTRICTED_ANONYMIZE_ROLES.has(role))) {
    return true;
  }

  if (
    roles.some((role) => requiresAssignedLocations(role) && ANONYMIZE_PERSON_ROLES.has(role))
  ) {
    return (locationIds?.length ?? 0) > 0;
  }

  return false;
}
