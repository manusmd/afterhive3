import {
  requiresAssignedLocations,
  type RoleAssignmentLocation,
} from "../location/role-location-scope";

const STAFF_ASSIGNERS = new Set([
  "tenant_owner",
  "tenant_admin",
  "tenant_office",
  "tenant_location_manager",
]);

const UNRESTRICTED_STAFF_ASSIGNERS = new Set(["tenant_owner", "tenant_admin"]);

const SCOPED_STAFF_ASSIGNERS = new Set(["tenant_office", "tenant_location_manager"]);

export function resolveAssignSessionStaffLocationIds(
  roles: string[],
  assignments: RoleAssignmentLocation[],
): string[] | undefined {
  const assignerAssignments = assignments.filter((entry) => STAFF_ASSIGNERS.has(entry.role));

  const hasUnrestrictedAssign = assignerAssignments.some(
    (entry) =>
      UNRESTRICTED_STAFF_ASSIGNERS.has(entry.role) &&
      (!entry.locationIds || entry.locationIds.length === 0),
  );

  if (hasUnrestrictedAssign) {
    return undefined;
  }

  const scopedIds = assignerAssignments.flatMap((entry) => {
    const ids = entry.locationIds ?? [];

    if (UNRESTRICTED_STAFF_ASSIGNERS.has(entry.role) && ids.length > 0) {
      return ids;
    }

    if (SCOPED_STAFF_ASSIGNERS.has(entry.role) && ids.length > 0) {
      return ids;
    }

    return [];
  });

  return [...new Set(scopedIds)];
}

export function canAssignSessionStaff(
  roles: string[],
  locationIds?: string[],
  assignments?: RoleAssignmentLocation[],
) {
  if (!roles.some((role) => STAFF_ASSIGNERS.has(role))) {
    return false;
  }

  if (assignments) {
    const assignScope = resolveAssignSessionStaffLocationIds(roles, assignments);
    if (assignScope === undefined) {
      return true;
    }
    return assignScope.length > 0;
  }

  if (roles.some((role) => UNRESTRICTED_STAFF_ASSIGNERS.has(role))) {
    return true;
  }

  if (roles.some((role) => requiresAssignedLocations(role) && STAFF_ASSIGNERS.has(role))) {
    return (locationIds?.length ?? 0) > 0;
  }

  return false;
}
