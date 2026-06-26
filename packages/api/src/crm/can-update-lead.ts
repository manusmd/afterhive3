import {
  requiresAssignedLocations,
  type RoleAssignmentLocation,
} from "../location/role-location-scope";

const LEAD_UPDATERS = new Set([
  "tenant_owner",
  "tenant_admin",
  "tenant_office",
  "tenant_location_manager",
]);

const UNRESTRICTED_LEAD_UPDATERS = new Set(["tenant_owner", "tenant_admin"]);

const SCOPED_LEAD_UPDATERS = new Set(["tenant_office", "tenant_location_manager"]);

export function resolveLeadUpdateLocationIds(
  roles: string[],
  assignments: RoleAssignmentLocation[],
): string[] | undefined {
  const updaterAssignments = assignments.filter((entry) => LEAD_UPDATERS.has(entry.role));

  const hasUnrestrictedUpdate = updaterAssignments.some(
    (entry) =>
      UNRESTRICTED_LEAD_UPDATERS.has(entry.role) &&
      (!entry.locationIds || entry.locationIds.length === 0),
  );

  if (hasUnrestrictedUpdate) {
    return undefined;
  }

  const scopedIds = updaterAssignments.flatMap((entry) => {
    const ids = entry.locationIds ?? [];

    if (UNRESTRICTED_LEAD_UPDATERS.has(entry.role) && ids.length > 0) {
      return ids;
    }

    if (SCOPED_LEAD_UPDATERS.has(entry.role) && ids.length > 0) {
      return ids;
    }

    return [];
  });

  return [...new Set(scopedIds)];
}

export function canUpdateLeadStatus(
  roles: string[],
  locationIds?: string[],
  assignments?: RoleAssignmentLocation[],
) {
  if (!roles.some((role) => LEAD_UPDATERS.has(role))) {
    return false;
  }

  if (assignments) {
    const updateScope = resolveLeadUpdateLocationIds(roles, assignments);
    if (updateScope === undefined) {
      return true;
    }
    return updateScope.length > 0;
  }

  if (roles.some((role) => UNRESTRICTED_LEAD_UPDATERS.has(role))) {
    return true;
  }

  if (roles.some((role) => requiresAssignedLocations(role) && LEAD_UPDATERS.has(role))) {
    return (locationIds?.length ?? 0) > 0;
  }

  return false;
}
