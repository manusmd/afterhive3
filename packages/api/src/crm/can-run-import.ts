import {
  requiresAssignedLocations,
  type RoleAssignmentLocation,
} from "../location/role-location-scope";

const IMPORT_RUNNERS = new Set([
  "tenant_owner",
  "tenant_admin",
  "tenant_office",
  "tenant_location_manager",
]);

const UNRESTRICTED_IMPORT_RUNNERS = new Set(["tenant_owner", "tenant_admin"]);

const SCOPED_IMPORT_RUNNERS = new Set(["tenant_office", "tenant_location_manager"]);

export function resolveImportLocationIds(
  roles: string[],
  assignments: RoleAssignmentLocation[],
): string[] | undefined {
  const runnerAssignments = assignments.filter((entry) => IMPORT_RUNNERS.has(entry.role));

  const hasUnrestrictedImport = runnerAssignments.some(
    (entry) =>
      UNRESTRICTED_IMPORT_RUNNERS.has(entry.role) &&
      (!entry.locationIds || entry.locationIds.length === 0),
  );

  if (hasUnrestrictedImport) {
    return undefined;
  }

  const scopedIds = runnerAssignments.flatMap((entry) => {
    const ids = entry.locationIds ?? [];

    if (UNRESTRICTED_IMPORT_RUNNERS.has(entry.role) && ids.length > 0) {
      return ids;
    }

    if (SCOPED_IMPORT_RUNNERS.has(entry.role) && ids.length > 0) {
      return ids;
    }

    return [];
  });

  return [...new Set(scopedIds)];
}

export function canRunImport(
  roles: string[],
  locationIds?: string[],
  assignments?: RoleAssignmentLocation[],
) {
  if (!roles.some((role) => IMPORT_RUNNERS.has(role))) {
    return false;
  }

  if (assignments) {
    const importScope = resolveImportLocationIds(roles, assignments);
    if (importScope === undefined) {
      return true;
    }
    return importScope.length > 0;
  }

  if (roles.some((role) => UNRESTRICTED_IMPORT_RUNNERS.has(role))) {
    return true;
  }

  if (roles.some((role) => requiresAssignedLocations(role) && IMPORT_RUNNERS.has(role))) {
    return (locationIds?.length ?? 0) > 0;
  }

  return false;
}
