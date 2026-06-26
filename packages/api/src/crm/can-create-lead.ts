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
  if (roles.some((role) => UNRESTRICTED_LEAD_CREATORS.has(role))) {
    return undefined;
  }

  const scopedIds = assignments
    .filter((entry) => SCOPED_LEAD_CREATORS.has(entry.role))
    .flatMap((entry) => entry.locationIds ?? []);

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

  if (roles.some((role) => UNRESTRICTED_LEAD_CREATORS.has(role))) {
    return true;
  }

  if (assignments) {
    const createScope = resolveLeadCreateLocationIds(roles, assignments);
    return createScope !== undefined && createScope.length > 0;
  }

  if (roles.some((role) => requiresAssignedLocations(role) && LEAD_CREATORS.has(role))) {
    return (locationIds?.length ?? 0) > 0;
  }

  return false;
}
