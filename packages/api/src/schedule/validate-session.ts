import { and, eq, inArray, lt, ne, gt } from "drizzle-orm";
import type { Db } from "@afterhive/db";
import { sessionStaffAssignments, sessions } from "@afterhive/db/schema";

type SessionValidatorDb = Pick<Db, "select">;

export type SessionConflictType = "staff_double_book";

export type SessionConflict = {
  type: SessionConflictType;
  severity: "error";
  userId: string;
  conflictingSessionId: string;
};

export type ValidateSessionInput = {
  tenantId: string;
  startsAt: Date;
  endsAt: Date;
  staffUserIds: string[];
  excludeSessionId?: string;
};

const ACTIVE_SESSION_STATUSES = ["scheduled", "in_progress"] as const;

export async function findStaffDoubleBookConflicts(
  db: SessionValidatorDb,
  input: ValidateSessionInput,
): Promise<SessionConflict[]> {
  const conflicts: SessionConflict[] = [];

  for (const userId of input.staffUserIds) {
    const rows = await db
      .select({
        conflictingSessionId: sessions.id,
      })
      .from(sessionStaffAssignments)
      .innerJoin(sessions, eq(sessionStaffAssignments.sessionId, sessions.id))
      .where(
        and(
          eq(sessionStaffAssignments.tenantId, input.tenantId),
          eq(sessionStaffAssignments.userId, userId),
          inArray(sessions.status, [...ACTIVE_SESSION_STATUSES]),
          lt(sessions.startsAt, input.endsAt),
          gt(sessions.endsAt, input.startsAt),
          input.excludeSessionId ? ne(sessions.id, input.excludeSessionId) : undefined,
        ),
      );

    for (const row of rows) {
      conflicts.push({
        type: "staff_double_book",
        severity: "error",
        userId,
        conflictingSessionId: row.conflictingSessionId,
      });
    }
  }

  return conflicts;
}

export async function validateSession(
  db: SessionValidatorDb,
  input: ValidateSessionInput,
): Promise<SessionConflict[]> {
  if (input.staffUserIds.length === 0) {
    return [];
  }

  return findStaffDoubleBookConflicts(db, input);
}
