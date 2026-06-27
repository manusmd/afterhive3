import {
  requiresAssignedLocations,
  type RoleAssignmentLocation,
} from "../location/role-location-scope";

const ATTENDANCE_WRITERS = new Set([
  "tenant_owner",
  "tenant_admin",
  "tenant_office",
  "tenant_coach",
  "tenant_location_manager",
]);

const UNRESTRICTED_ATTENDANCE_WRITERS = new Set(["tenant_owner", "tenant_admin"]);

const SCOPED_ATTENDANCE_WRITERS = new Set(["tenant_office", "tenant_location_manager"]);

export function resolveRecordAttendanceLocationIds(
  roles: string[],
  assignments: RoleAssignmentLocation[],
): string[] | undefined {
  const writerAssignments = assignments.filter((entry) => ATTENDANCE_WRITERS.has(entry.role));

  const hasUnrestrictedWrite = writerAssignments.some(
    (entry) =>
      UNRESTRICTED_ATTENDANCE_WRITERS.has(entry.role) &&
      (!entry.locationIds || entry.locationIds.length === 0),
  );

  if (hasUnrestrictedWrite) {
    return undefined;
  }

  const scopedIds = writerAssignments.flatMap((entry) => {
    const ids = entry.locationIds ?? [];

    if (UNRESTRICTED_ATTENDANCE_WRITERS.has(entry.role) && ids.length > 0) {
      return ids;
    }

    if (SCOPED_ATTENDANCE_WRITERS.has(entry.role) && ids.length > 0) {
      return ids;
    }

    return [];
  });

  return [...new Set(scopedIds)];
}

export function canRecordAttendance(
  roles: string[],
  locationIds?: string[],
  assignments?: RoleAssignmentLocation[],
) {
  if (!roles.some((role) => ATTENDANCE_WRITERS.has(role))) {
    return false;
  }

  if (roles.some((role) => role === "tenant_coach")) {
    return true;
  }

  if (assignments) {
    const writeScope = resolveRecordAttendanceLocationIds(roles, assignments);
    if (writeScope === undefined) {
      return true;
    }
    return writeScope.length > 0;
  }

  if (roles.some((role) => UNRESTRICTED_ATTENDANCE_WRITERS.has(role))) {
    return true;
  }

  if (roles.some((role) => requiresAssignedLocations(role) && ATTENDANCE_WRITERS.has(role))) {
    return (locationIds?.length ?? 0) > 0;
  }

  return false;
}
