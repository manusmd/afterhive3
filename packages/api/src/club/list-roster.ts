import { and, asc, eq } from "drizzle-orm";
import { getDb } from "@afterhive/db";
import {
  departments,
  memberProfiles,
  persons,
  rosterEntries,
  teams,
  tenants,
} from "@afterhive/db/schema";
import type { SessionContext } from "@afterhive/domain";
import { isWithinLocationScope } from "../location/location-scope";
import { canReadRoster, resolveReadRosterLocationIds } from "./can-read-roster";

export type RosterEntryItem = {
  id: string;
  memberProfileId: string;
  memberLabel: string;
  jerseyNumber: string | null;
  status: "active" | "inactive";
  fromDate: string;
};

export type TeamRosterView = {
  teamId: string;
  teamName: string;
  departmentName: string;
  entries: RosterEntryItem[];
};

export async function getTeamRoster(
  session: SessionContext,
  tenantSlug: string,
  teamId: string,
): Promise<TeamRosterView | null> {
  if (!session.tenantId || !canReadRoster(session.roles, session.locationIds, session.roleAssignments)) {
    return null;
  }

  const readLocationIds = session.roleAssignments
    ? resolveReadRosterLocationIds(session.roles, session.roleAssignments)
    : session.locationIds;

  const db = getDb();
  const [teamRow] = await db
    .select({
      teamId: teams.id,
      teamName: teams.name,
      departmentName: departments.name,
      locationId: departments.locationId,
    })
    .from(teams)
    .innerJoin(departments, eq(teams.departmentId, departments.id))
    .innerJoin(tenants, eq(teams.tenantId, tenants.id))
    .where(
      and(eq(teams.id, teamId), eq(tenants.slug, tenantSlug), eq(teams.tenantId, session.tenantId)),
    )
    .limit(1);

  if (!teamRow || !isWithinLocationScope(teamRow.locationId, readLocationIds)) {
    return null;
  }

  const rows = await db
    .select({
      id: rosterEntries.id,
      memberProfileId: rosterEntries.memberProfileId,
      jerseyNumber: rosterEntries.jerseyNumber,
      status: rosterEntries.status,
      fromDate: rosterEntries.fromDate,
      memberNumber: memberProfiles.memberNumber,
      firstName: persons.firstName,
      lastName: persons.lastName,
    })
    .from(rosterEntries)
    .innerJoin(memberProfiles, eq(rosterEntries.memberProfileId, memberProfiles.id))
    .innerJoin(persons, eq(memberProfiles.personId, persons.id))
    .where(and(eq(rosterEntries.teamId, teamId), eq(rosterEntries.tenantId, session.tenantId)))
    .orderBy(asc(persons.lastName), asc(persons.firstName));

  return {
    teamId: teamRow.teamId,
    teamName: teamRow.teamName,
    departmentName: teamRow.departmentName,
    entries: rows.map((row) => ({
      id: row.id,
      memberProfileId: row.memberProfileId,
      memberLabel: `${row.firstName} ${row.lastName} (${row.memberNumber})`,
      jerseyNumber: row.jerseyNumber,
      status: row.status,
      fromDate: row.fromDate,
    })),
  };
}

export type TeamListItem = {
  teamId: string;
  teamName: string;
  departmentName: string;
};

export async function listTeams(
  session: SessionContext,
  tenantSlug: string,
): Promise<TeamListItem[]> {
  if (!session.tenantId || !canReadRoster(session.roles, session.locationIds, session.roleAssignments)) {
    return [];
  }

  const readLocationIds = session.roleAssignments
    ? resolveReadRosterLocationIds(session.roles, session.roleAssignments)
    : session.locationIds;

  const db = getDb();
  const rows = await db
    .select({
      teamId: teams.id,
      teamName: teams.name,
      departmentName: departments.name,
      locationId: departments.locationId,
    })
    .from(teams)
    .innerJoin(departments, eq(teams.departmentId, departments.id))
    .innerJoin(tenants, eq(teams.tenantId, tenants.id))
    .where(and(eq(tenants.slug, tenantSlug), eq(teams.tenantId, session.tenantId)))
    .orderBy(asc(departments.name), asc(teams.name));

  return rows
    .filter((row) => isWithinLocationScope(row.locationId, readLocationIds))
    .map((row) => ({
      teamId: row.teamId,
      teamName: row.teamName,
      departmentName: row.departmentName,
    }));
}

export type RosterMemberOption = {
  memberProfileId: string;
  label: string;
};

export async function listRosterMemberOptions(
  session: SessionContext,
  tenantSlug: string,
): Promise<RosterMemberOption[]> {
  if (
    !session.tenantId ||
    !canReadRoster(session.roles, session.locationIds, session.roleAssignments)
  ) {
    return [];
  }

  const db = getDb();
  const rows = await db
    .select({
      memberProfileId: memberProfiles.id,
      memberNumber: memberProfiles.memberNumber,
      firstName: persons.firstName,
      lastName: persons.lastName,
    })
    .from(memberProfiles)
    .innerJoin(persons, eq(memberProfiles.personId, persons.id))
    .innerJoin(tenants, eq(memberProfiles.tenantId, tenants.id))
    .where(and(eq(tenants.slug, tenantSlug), eq(memberProfiles.tenantId, session.tenantId)))
    .orderBy(asc(persons.lastName), asc(persons.firstName));

  return rows.map((row) => ({
    memberProfileId: row.memberProfileId,
    label: `${row.firstName} ${row.lastName} (${row.memberNumber})`,
  }));
}
