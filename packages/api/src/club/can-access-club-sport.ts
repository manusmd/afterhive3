import type { SessionContext } from "@afterhive/domain";
import { tenantHasClubSportModule } from "../tenant/has-club-sport-module";
import { canReadRoster } from "./can-read-roster";
import { canUpdateRoster } from "./can-update-roster";

export async function canAccessClubSport(session: SessionContext): Promise<boolean> {
  if (!session.tenantId) {
    return false;
  }

  if (!canReadRoster(session.roles, session.locationIds, session.roleAssignments)) {
    return false;
  }

  return tenantHasClubSportModule(session.tenantId);
}

export async function canManageClubRoster(session: SessionContext): Promise<boolean> {
  if (!session.tenantId) {
    return false;
  }

  if (!canUpdateRoster(session.roles, session.locationIds, session.roleAssignments)) {
    return false;
  }

  return tenantHasClubSportModule(session.tenantId);
}
