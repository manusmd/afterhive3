import type { SessionContext } from "@afterhive/domain";
import {
  requiresAssignedLocations,
  type RoleAssignmentLocation,
} from "../location/role-location-scope";

export const EXPORT_PERSON_ROLES = new Set([
  "tenant_owner",
  "tenant_admin",
  "tenant_office",
  "tenant_location_manager",
]);

const UNRESTRICTED_EXPORT_ROLES = new Set(["tenant_owner", "tenant_admin"]);

const SCOPED_EXPORT_ROLES = new Set(["tenant_office", "tenant_location_manager"]);

export function resolveExportLocationIds(
  roles: string[],
  assignments: RoleAssignmentLocation[],
): string[] | undefined {
  const exportAssignments = assignments.filter((entry) => EXPORT_PERSON_ROLES.has(entry.role));

  const hasUnrestrictedExport = exportAssignments.some(
    (entry) =>
      UNRESTRICTED_EXPORT_ROLES.has(entry.role) &&
      (!entry.locationIds || entry.locationIds.length === 0),
  );

  if (hasUnrestrictedExport) {
    return undefined;
  }

  const scopedIds = exportAssignments.flatMap((entry) => {
    const ids = entry.locationIds ?? [];

    if (UNRESTRICTED_EXPORT_ROLES.has(entry.role) && ids.length > 0) {
      return ids;
    }

    if (SCOPED_EXPORT_ROLES.has(entry.role) && ids.length > 0) {
      return ids;
    }

    return [];
  });

  return [...new Set(scopedIds)];
}

export function resolveSessionExportLocationIds(session: SessionContext): string[] | undefined {
  if (session.roleAssignments) {
    return resolveExportLocationIds(session.roles, session.roleAssignments);
  }

  if (session.roles.some((role) => UNRESTRICTED_EXPORT_ROLES.has(role))) {
    return undefined;
  }

  return session.locationIds;
}

export function canExportPerson(
  roles: string[],
  locationIds?: string[],
  assignments?: RoleAssignmentLocation[],
) {
  if (!roles.some((role) => EXPORT_PERSON_ROLES.has(role))) {
    return false;
  }

  if (assignments) {
    const exportScope = resolveExportLocationIds(roles, assignments);
    if (exportScope === undefined) {
      return true;
    }
    return exportScope.length > 0;
  }

  if (roles.some((role) => UNRESTRICTED_EXPORT_ROLES.has(role))) {
    return true;
  }

  if (roles.some((role) => requiresAssignedLocations(role) && EXPORT_PERSON_ROLES.has(role))) {
    return (locationIds?.length ?? 0) > 0;
  }

  return false;
}
