import {
  requiresAssignedLocations,
  type RoleAssignmentLocation,
} from "../location/role-location-scope";

const LEAD_CONVERTERS = new Set([
  "tenant_owner",
  "tenant_admin",
  "tenant_office",
  "tenant_location_manager",
]);

const UNRESTRICTED_LEAD_CONVERTERS = new Set(["tenant_owner", "tenant_admin"]);

const SCOPED_LEAD_CONVERTERS = new Set(["tenant_office", "tenant_location_manager"]);

export function resolveLeadConvertLocationIds(
  roles: string[],
  assignments: RoleAssignmentLocation[],
): string[] | undefined {
  const converterAssignments = assignments.filter((entry) => LEAD_CONVERTERS.has(entry.role));

  const hasUnrestrictedConvert = converterAssignments.some(
    (entry) =>
      UNRESTRICTED_LEAD_CONVERTERS.has(entry.role) &&
      (!entry.locationIds || entry.locationIds.length === 0),
  );

  if (hasUnrestrictedConvert) {
    return undefined;
  }

  const scopedIds = converterAssignments.flatMap((entry) => {
    const ids = entry.locationIds ?? [];

    if (UNRESTRICTED_LEAD_CONVERTERS.has(entry.role) && ids.length > 0) {
      return ids;
    }

    if (SCOPED_LEAD_CONVERTERS.has(entry.role) && ids.length > 0) {
      return ids;
    }

    return [];
  });

  return [...new Set(scopedIds)];
}

export function canConvertLead(
  roles: string[],
  locationIds?: string[],
  assignments?: RoleAssignmentLocation[],
) {
  if (!roles.some((role) => LEAD_CONVERTERS.has(role))) {
    return false;
  }

  if (assignments) {
    const convertScope = resolveLeadConvertLocationIds(roles, assignments);
    if (convertScope === undefined) {
      return true;
    }
    return convertScope.length > 0;
  }

  if (roles.some((role) => UNRESTRICTED_LEAD_CONVERTERS.has(role))) {
    return true;
  }

  if (roles.some((role) => requiresAssignedLocations(role) && LEAD_CONVERTERS.has(role))) {
    return (locationIds?.length ?? 0) > 0;
  }

  return false;
}

export function isLeadConvertibleStatus(status: string) {
  return status === "qualified";
}
