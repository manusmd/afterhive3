import {
  requiresAssignedLocations,
  type RoleAssignmentLocation,
} from "../location/role-location-scope";

const ROSTER_READERS = new Set([
  "tenant_owner",
  "tenant_admin",
  "tenant_office",
  "tenant_coach",
  "tenant_location_manager",
]);

const UNRESTRICTED_ROSTER_READERS = new Set(["tenant_owner", "tenant_admin"]);

const SCOPED_ROSTER_READERS = new Set([
  "tenant_office",
  "tenant_coach",
  "tenant_location_manager",
]);

export function resolveReadRosterLocationIds(
  roles: string[],
  assignments: RoleAssignmentLocation[],
): string[] | undefined {
  const readerAssignments = assignments.filter((entry) => ROSTER_READERS.has(entry.role));

  const hasUnrestrictedRead = readerAssignments.some(
    (entry) =>
      UNRESTRICTED_ROSTER_READERS.has(entry.role) &&
      (!entry.locationIds || entry.locationIds.length === 0),
  );

  if (hasUnrestrictedRead) {
    return undefined;
  }

  const scopedIds = readerAssignments.flatMap((entry) => {
    const ids = entry.locationIds ?? [];

    if (UNRESTRICTED_ROSTER_READERS.has(entry.role) && ids.length > 0) {
      return ids;
    }

    if (SCOPED_ROSTER_READERS.has(entry.role) && ids.length > 0) {
      return ids;
    }

    return [];
  });

  return [...new Set(scopedIds)];
}

export function canReadRoster(
  roles: string[],
  locationIds?: string[],
  assignments?: RoleAssignmentLocation[],
) {
  if (!roles.some((role) => ROSTER_READERS.has(role))) {
    return false;
  }

  if (assignments) {
    const readScope = resolveReadRosterLocationIds(roles, assignments);
    if (readScope === undefined) {
      return true;
    }
    return readScope.length > 0;
  }

  if (roles.some((role) => UNRESTRICTED_ROSTER_READERS.has(role))) {
    return true;
  }

  if (roles.some((role) => requiresAssignedLocations(role) && ROSTER_READERS.has(role))) {
    return (locationIds?.length ?? 0) > 0;
  }

  return false;
}
