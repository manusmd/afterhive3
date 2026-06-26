export const ALL_LOCATION_ROLES = new Set([
  "tenant_owner",
  "tenant_admin",
  "tenant_finance",
]);

export const ASSIGNED_LOCATION_ROLES = new Set([
  "tenant_office",
  "tenant_coach",
  "tenant_location_manager",
]);

export type RoleAssignmentLocation = {
  role: string;
  locationIds: string[] | null;
};

export function requiresAssignedLocations(role: string) {
  return ASSIGNED_LOCATION_ROLES.has(role);
}

export function hasAllLocationsByDefault(role: string) {
  return ALL_LOCATION_ROLES.has(role);
}

export function validateStaffRoleLocations(role: string, locationIds?: string[]) {
  if (requiresAssignedLocations(role) && (!locationIds || locationIds.length === 0)) {
    return { ok: false as const, code: "locations_required" as const };
  }

  return { ok: true as const };
}

export function resolveSessionLocationIds(
  assignments: RoleAssignmentLocation[],
): string[] | undefined {
  const hasUnrestrictedAllLocations = assignments.some(
    (entry) =>
      hasAllLocationsByDefault(entry.role) &&
      (!entry.locationIds || entry.locationIds.length === 0),
  );

  if (hasUnrestrictedAllLocations) {
    return undefined;
  }

  const scopedIds = assignments.flatMap((entry) => {
    const ids = entry.locationIds ?? [];

    if (hasAllLocationsByDefault(entry.role) && ids.length > 0) {
      return ids;
    }

    if (requiresAssignedLocations(entry.role) && ids.length > 0) {
      return ids;
    }

    return [];
  });

  return [...new Set(scopedIds)];
}
