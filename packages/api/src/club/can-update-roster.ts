import {
  requiresAssignedLocations,
  type RoleAssignmentLocation,
} from "../location/role-location-scope";

const ROSTER_WRITERS = new Set([
  "tenant_owner",
  "tenant_admin",
  "tenant_office",
  "tenant_location_manager",
]);

const UNRESTRICTED_ROSTER_WRITERS = new Set(["tenant_owner", "tenant_admin"]);

const SCOPED_ROSTER_WRITERS = new Set(["tenant_office", "tenant_location_manager"]);

export function resolveUpdateRosterLocationIds(
  roles: string[],
  assignments: RoleAssignmentLocation[],
): string[] | undefined {
  const writerAssignments = assignments.filter((entry) => ROSTER_WRITERS.has(entry.role));

  const hasUnrestrictedWrite = writerAssignments.some(
    (entry) =>
      UNRESTRICTED_ROSTER_WRITERS.has(entry.role) &&
      (!entry.locationIds || entry.locationIds.length === 0),
  );

  if (hasUnrestrictedWrite) {
    return undefined;
  }

  const scopedIds = writerAssignments.flatMap((entry) => {
    const ids = entry.locationIds ?? [];

    if (UNRESTRICTED_ROSTER_WRITERS.has(entry.role) && ids.length > 0) {
      return ids;
    }

    if (SCOPED_ROSTER_WRITERS.has(entry.role) && ids.length > 0) {
      return ids;
    }

    return [];
  });

  return [...new Set(scopedIds)];
}

export function canUpdateRoster(
  roles: string[],
  locationIds?: string[],
  assignments?: RoleAssignmentLocation[],
) {
  if (!roles.some((role) => ROSTER_WRITERS.has(role))) {
    return false;
  }

  if (assignments) {
    const writeScope = resolveUpdateRosterLocationIds(roles, assignments);
    if (writeScope === undefined) {
      return true;
    }
    return writeScope.length > 0;
  }

  if (roles.some((role) => UNRESTRICTED_ROSTER_WRITERS.has(role))) {
    return true;
  }

  if (roles.some((role) => requiresAssignedLocations(role) && ROSTER_WRITERS.has(role))) {
    return (locationIds?.length ?? 0) > 0;
  }

  return false;
}
