import { and, asc, eq, inArray } from "drizzle-orm";
import { getDb } from "@afterhive/db";
import {
  attendanceRecords,
  enrollments,
  memberProfiles,
  offerGroups,
  offers,
  persons,
  rosterEntries,
  sessionStaffAssignments,
  sessions,
  teams,
  tenants,
} from "@afterhive/db/schema";
import type { SessionContext } from "@afterhive/domain";
import { canReadSessions } from "./can-read-sessions";
import { isWithinLocationScope } from "../location/location-scope";
import {
  canRecordAttendance,
  resolveRecordAttendanceLocationIds,
} from "./can-record-attendance";

export type AttendanceStatus = "present" | "absent" | "excused" | "late";

export type SessionAttendanceMember = {
  memberProfileId: string;
  memberLabel: string;
  status: AttendanceStatus | null;
  notes: string | null;
};

export type SessionAttendanceView = {
  sessionId: string;
  sessionLabel: string;
  startsAt: string;
  endsAt: string;
  canRecord: boolean;
  members: SessionAttendanceMember[];
};

const ELIGIBLE_ENROLLMENT_STATUSES = ["active", "pending"] as const;

export async function canRecordAttendanceForSession(
  session: SessionContext,
  tenantSlug: string,
  sessionId: string,
): Promise<boolean> {
  if (
    !session.tenantId ||
    !canRecordAttendance(session.roles, session.locationIds, session.roleAssignments)
  ) {
    return false;
  }

  const writeLocationIds = session.roleAssignments
    ? resolveRecordAttendanceLocationIds(session.roles, session.roleAssignments)
    : session.locationIds;

  const db = getDb();
  const [sessionRow] = await db
    .select({
      sessionId: sessions.id,
      locationId: sessions.locationId,
    })
    .from(sessions)
    .innerJoin(tenants, eq(sessions.tenantId, tenants.id))
    .where(
      and(
        eq(sessions.id, sessionId),
        eq(sessions.tenantId, session.tenantId),
        eq(tenants.slug, tenantSlug),
      ),
    )
    .limit(1);

  if (!sessionRow) {
    return false;
  }

  const inLocationScope = isWithinLocationScope(sessionRow.locationId, writeLocationIds);

  let coachAssigned = false;
  if (session.roles.includes("tenant_coach")) {
    const [assignment] = await db
      .select({ id: sessionStaffAssignments.id })
      .from(sessionStaffAssignments)
      .where(
        and(
          eq(sessionStaffAssignments.sessionId, sessionId),
          eq(sessionStaffAssignments.userId, session.userId),
          eq(sessionStaffAssignments.tenantId, session.tenantId),
        ),
      )
      .limit(1);

    coachAssigned = !!assignment;
  }

  if (coachAssigned) {
    return true;
  }

  const hasNonCoachWriteRole = session.roles.some(
    (role) =>
      (role === "tenant_owner" ||
        role === "tenant_admin" ||
        role === "tenant_office" ||
        role === "tenant_location_manager") &&
      canRecordAttendance([role], session.locationIds, session.roleAssignments),
  );

  return hasNonCoachWriteRole && inLocationScope;
}

async function loadEligibleMembers(
  tenantId: string,
  offerGroupId: string,
  offerId: string,
): Promise<Map<string, string>> {
  const db = getDb();
  const members = new Map<string, string>();

  const enrollmentRows = await db
    .select({
      memberProfileId: memberProfiles.id,
      memberNumber: memberProfiles.memberNumber,
      firstName: persons.firstName,
      lastName: persons.lastName,
    })
    .from(enrollments)
    .innerJoin(memberProfiles, eq(enrollments.memberProfileId, memberProfiles.id))
    .innerJoin(persons, eq(memberProfiles.personId, persons.id))
    .where(
      and(
        eq(enrollments.tenantId, tenantId),
        eq(enrollments.offerGroupId, offerGroupId),
        inArray(enrollments.status, [...ELIGIBLE_ENROLLMENT_STATUSES]),
      ),
    );

  for (const row of enrollmentRows) {
    members.set(row.memberProfileId, `${row.firstName} ${row.lastName} (${row.memberNumber})`);
  }

  const rosterRows = await db
    .select({
      memberProfileId: memberProfiles.id,
      memberNumber: memberProfiles.memberNumber,
      firstName: persons.firstName,
      lastName: persons.lastName,
    })
    .from(rosterEntries)
    .innerJoin(teams, eq(rosterEntries.teamId, teams.id))
    .innerJoin(memberProfiles, eq(rosterEntries.memberProfileId, memberProfiles.id))
    .innerJoin(persons, eq(memberProfiles.personId, persons.id))
    .where(
      and(
        eq(rosterEntries.tenantId, tenantId),
        eq(teams.offerId, offerId),
        eq(rosterEntries.status, "active"),
      ),
    );

  for (const row of rosterRows) {
    if (!members.has(row.memberProfileId)) {
      members.set(row.memberProfileId, `${row.firstName} ${row.lastName} (${row.memberNumber})`);
    }
  }

  return members;
}

export async function getSessionAttendance(
  session: SessionContext,
  tenantSlug: string,
  sessionId: string,
): Promise<SessionAttendanceView | null> {
  if (!session.tenantId || !canReadSessions(session.roles, session.locationIds)) {
    return null;
  }

  const db = getDb();
  const [sessionRow] = await db
    .select({
      sessionId: sessions.id,
      startsAt: sessions.startsAt,
      endsAt: sessions.endsAt,
      locationId: sessions.locationId,
      offerGroupId: sessions.offerGroupId,
      offerId: offerGroups.offerId,
      offerName: offers.name,
      groupName: offerGroups.name,
    })
    .from(sessions)
    .innerJoin(offerGroups, eq(sessions.offerGroupId, offerGroups.id))
    .innerJoin(offers, eq(offerGroups.offerId, offers.id))
    .innerJoin(tenants, eq(sessions.tenantId, tenants.id))
    .where(
      and(
        eq(sessions.id, sessionId),
        eq(sessions.tenantId, session.tenantId),
        eq(tenants.slug, tenantSlug),
      ),
    )
    .limit(1);

  if (!sessionRow || !isWithinLocationScope(sessionRow.locationId, session.locationIds)) {
    return null;
  }

  const eligibleMembers = await loadEligibleMembers(
    session.tenantId,
    sessionRow.offerGroupId,
    sessionRow.offerId,
  );

  const attendanceRows =
    eligibleMembers.size === 0
      ? []
      : await db
          .select({
            memberProfileId: attendanceRecords.memberProfileId,
            status: attendanceRecords.status,
            notes: attendanceRecords.notes,
          })
          .from(attendanceRecords)
          .where(
            and(
              eq(attendanceRecords.sessionId, sessionId),
              eq(attendanceRecords.tenantId, session.tenantId),
              inArray(attendanceRecords.memberProfileId, [...eligibleMembers.keys()]),
            ),
          );

  const attendanceByMember = new Map(
    attendanceRows.map((row) => [row.memberProfileId, row] as const),
  );

  const members = [...eligibleMembers.entries()]
    .sort(([, labelA], [, labelB]) => labelA.localeCompare(labelB))
    .map(([memberProfileId, memberLabel]) => {
      const record = attendanceByMember.get(memberProfileId);
      return {
        memberProfileId,
        memberLabel,
        status: record?.status ?? null,
        notes: record?.notes ?? null,
      };
    });

  const canRecord = await canRecordAttendanceForSession(session, tenantSlug, sessionId);

  return {
    sessionId: sessionRow.sessionId,
    sessionLabel: `${sessionRow.offerName} · ${sessionRow.groupName}`,
    startsAt: sessionRow.startsAt.toISOString(),
    endsAt: sessionRow.endsAt.toISOString(),
    canRecord,
    members,
  };
}

export type SessionListItem = {
  sessionId: string;
  label: string;
};

export async function listAttendanceSessions(
  session: SessionContext,
  tenantSlug: string,
): Promise<SessionListItem[]> {
  if (!session.tenantId || !canReadSessions(session.roles, session.locationIds)) {
    return [];
  }

  const db = getDb();
  const rows = await db
    .select({
      sessionId: sessions.id,
      startsAt: sessions.startsAt,
      offerName: offers.name,
      groupName: offerGroups.name,
      locationId: sessions.locationId,
    })
    .from(sessions)
    .innerJoin(offerGroups, eq(sessions.offerGroupId, offerGroups.id))
    .innerJoin(offers, eq(offerGroups.offerId, offers.id))
    .innerJoin(tenants, eq(sessions.tenantId, tenants.id))
    .where(and(eq(tenants.slug, tenantSlug), eq(sessions.tenantId, session.tenantId)))
    .orderBy(asc(sessions.startsAt));

  return rows
    .filter((row) => isWithinLocationScope(row.locationId, session.locationIds))
    .map((row) => ({
      sessionId: row.sessionId,
      label: `${row.offerName} · ${row.groupName} · ${row.startsAt.toISOString()}`,
    }));
}

export async function loadEligibleMemberIdsForSession(
  tenantId: string,
  offerGroupId: string,
  offerId: string,
): Promise<Set<string>> {
  const members = await loadEligibleMembers(tenantId, offerGroupId, offerId);
  return new Set(members.keys());
}
