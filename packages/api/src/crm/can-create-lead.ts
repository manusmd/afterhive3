import {
  requiresAssignedLocations,
  type RoleAssignmentLocation,
} from "../location/role-location-scope";

const LEAD_CREATORS = new Set([
  "tenant_owner",
  "tenant_admin",
  "tenant_office",
  "tenant_location_manager",
]);

const UNRESTRICTED_LEAD_CREATORS = new Set(["tenant_owner", "tenant_admin"]);

const SCOPED_LEAD_CREATORS = new Set(["tenant_office", "tenant_location_manager"]);

export function resolveLeadCreateLocationIds(
  roles: string[],
  assignments: RoleAssignmentLocation[],
): string[] | undefined {
  const creatorAssignments = assignments.filter((entry) => LEAD_CREATORS.has(entry.role));

  const hasUnrestrictedCreate = creatorAssignments.some(
    (entry) =>
      UNRESTRICTED_LEAD_CREATORS.has(entry.role) &&
      (!entry.locationIds || entry.locationIds.length === 0),
  );

  if (hasUnrestrictedCreate) {
    return undefined;
  }

  const scopedIds = creatorAssignments.flatMap((entry) => {
    const ids = entry.locationIds ?? [];

    if (UNRESTRICTED_LEAD_CREATORS.has(entry.role) && ids.length > 0) {
      return ids;
    }

    if (SCOPED_LEAD_CREATORS.has(entry.role) && ids.length > 0) {
      return ids;
    }

    return [];
  });

  return [...new Set(scopedIds)];
}

export function canCreateLead(
  roles: string[],
  locationIds?: string[],
  assignments?: RoleAssignmentLocation[],
) {
  if (!roles.some((role) => LEAD_CREATORS.has(role))) {
    return false;
  }

  if (assignments) {
    const createScope = resolveLeadCreateLocationIds(roles, assignments);
    if (createScope === undefined) {
      return true;
    }
    return createScope.length > 0;
  }

  if (roles.some((role) => UNRESTRICTED_LEAD_CREATORS.has(role))) {
    return true;
  }

  if (roles.some((role) => requiresAssignedLocations(role) && LEAD_CREATORS.has(role))) {
    return (locationIds?.length ?? 0) > 0;
  }

  return false;
}
