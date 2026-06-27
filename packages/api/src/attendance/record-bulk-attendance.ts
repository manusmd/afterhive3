import { and, eq } from "drizzle-orm";
import { getDb } from "@afterhive/db";
import {
  attendanceRecords,
  offerGroups,
  sessions,
  tenants,
} from "@afterhive/db/schema";
import type { SessionContext } from "@afterhive/domain";
import {
  canRecordAttendanceForSession,
  loadEligibleMemberIdsForSession,
  type AttendanceStatus,
} from "./list-session-attendance";
import { canRecordAttendance } from "./can-record-attendance";

export type RecordBulkAttendanceEntry = {
  memberProfileId: string;
  status: AttendanceStatus;
  notes?: string | null;
};

export type RecordBulkAttendanceInput = {
  sessionId: string;
  records: RecordBulkAttendanceEntry[];
};

export class RecordBulkAttendanceError extends Error {
  constructor(
    readonly code:
      | "tenant_not_found"
      | "forbidden"
      | "missing_fields"
      | "session_not_found"
      | "invalid_status"
      | "member_not_eligible"
      | "duplicate_member",
  ) {
    super(code);
    this.name = "RecordBulkAttendanceError";
  }
}

const ATTENDANCE_STATUSES = new Set<AttendanceStatus>([
  "present",
  "absent",
  "excused",
  "late",
]);

export function validateRecordBulkAttendanceInput(input: RecordBulkAttendanceInput) {
  if (typeof input.sessionId !== "string" || !Array.isArray(input.records)) {
    return "missing_fields" as const;
  }

  if (!input.sessionId.trim()) {
    return "missing_fields" as const;
  }

  for (const record of input.records) {
    if (typeof record.memberProfileId !== "string" || !record.memberProfileId.trim()) {
      return "missing_fields" as const;
    }

    if (!ATTENDANCE_STATUSES.has(record.status)) {
      return "invalid_status" as const;
    }
  }

  const memberIds = input.records.map((record) => record.memberProfileId);
  if (new Set(memberIds).size !== memberIds.length) {
    return "duplicate_member" as const;
  }

  return null;
}

export async function recordBulkAttendance(
  session: SessionContext,
  tenantSlug: string,
  input: RecordBulkAttendanceInput,
): Promise<void> {
  if (!session.tenantId) {
    throw new RecordBulkAttendanceError("tenant_not_found");
  }

  if (!canRecordAttendance(session.roles, session.locationIds, session.roleAssignments)) {
    throw new RecordBulkAttendanceError("forbidden");
  }

  const validationError = validateRecordBulkAttendanceInput(input);
  if (validationError) {
    throw new RecordBulkAttendanceError(validationError);
  }

  const canRecord = await canRecordAttendanceForSession(session, tenantSlug, input.sessionId);
  if (!canRecord) {
    throw new RecordBulkAttendanceError("forbidden");
  }

  const db = getDb();
  const recordedAt = new Date();

  await db.transaction(async (tx) => {
    const [sessionRow] = await tx
      .select({
        sessionId: sessions.id,
        offerGroupId: sessions.offerGroupId,
        offerId: offerGroups.offerId,
      })
      .from(sessions)
      .innerJoin(offerGroups, eq(sessions.offerGroupId, offerGroups.id))
      .innerJoin(tenants, eq(sessions.tenantId, tenants.id))
      .where(
        and(
          eq(sessions.id, input.sessionId),
          eq(sessions.tenantId, session.tenantId!),
          eq(tenants.slug, tenantSlug),
        ),
      )
      .limit(1);

    if (!sessionRow) {
      throw new RecordBulkAttendanceError("session_not_found");
    }

    const eligibleMemberIds = await loadEligibleMemberIdsForSession(
      session.tenantId!,
      sessionRow.offerGroupId,
      sessionRow.offerId,
    );

    for (const record of input.records) {
      if (!eligibleMemberIds.has(record.memberProfileId)) {
        throw new RecordBulkAttendanceError("member_not_eligible");
      }
    }

    for (const record of input.records) {
      const notes =
        typeof record.notes === "string" && record.notes.trim() ? record.notes.trim() : null;

      await tx
        .insert(attendanceRecords)
        .values({
          tenantId: session.tenantId!,
          sessionId: input.sessionId,
          memberProfileId: record.memberProfileId,
          status: record.status,
          recordedAt,
          recordedByUserId: session.userId,
          notes,
        })
        .onConflictDoUpdate({
          target: [attendanceRecords.sessionId, attendanceRecords.memberProfileId],
          set: {
            status: record.status,
            recordedAt,
            recordedByUserId: session.userId,
            notes,
          },
        });
    }
  });
}
