import { and, desc, eq, inArray } from "drizzle-orm";
import { getDb } from "@afterhive/db";
import {
  offerGroups,
  offers,
  sessionStaffAssignments,
  sessions,
  tenantMemberships,
  tenants,
  user,
} from "@afterhive/db/schema";
import type { SessionContext } from "@afterhive/domain";
import { isWithinLocationScope } from "../location/location-scope";
import {
  canAssignSessionStaff,
  resolveAssignSessionStaffLocationIds,
} from "./can-assign-session-staff";
import { validateSession } from "./validate-session";

export type AssignSessionStaffInput = {
  userId: string;
  role?: "lead" | "assistant";
};

export type AssignSessionStaffResult = {
  assignmentId: string;
  sessionId: string;
  userId: string;
  role: "lead" | "assistant";
};

export class AssignSessionStaffError extends Error {
  constructor(
    readonly code:
      | "tenant_not_found"
      | "forbidden"
      | "missing_fields"
      | "session_not_found"
      | "location_forbidden"
      | "staff_not_found"
      | "already_assigned"
      | "staff_double_book",
    readonly conflictingSessionId?: string,
  ) {
    super(code);
    this.name = "AssignSessionStaffError";
  }
}

const SCHEDULABLE_SESSION_STATUSES = ["scheduled", "in_progress"] as const;

export function validateAssignSessionStaffInput(input: AssignSessionStaffInput) {
  if (typeof input.userId !== "string" || !input.userId.trim()) {
    return "missing_fields" as const;
  }

  if (input.role !== undefined && input.role !== "lead" && input.role !== "assistant") {
    return "missing_fields" as const;
  }

  return null;
}

export async function assignSessionStaff(
  session: SessionContext,
  tenantSlug: string,
  sessionId: string,
  input: AssignSessionStaffInput,
): Promise<AssignSessionStaffResult> {
  if (!session.tenantId) {
    throw new AssignSessionStaffError("tenant_not_found");
  }

  if (!canAssignSessionStaff(session.roles, session.locationIds, session.roleAssignments)) {
    throw new AssignSessionStaffError("forbidden");
  }

  const validationError = validateAssignSessionStaffInput(input);
  if (validationError === "missing_fields") {
    throw new AssignSessionStaffError("missing_fields");
  }

  const assignLocationIds = session.roleAssignments
    ? resolveAssignSessionStaffLocationIds(session.roles, session.roleAssignments)
    : session.locationIds;

  const db = getDb();
  const role = input.role ?? "lead";

  return db.transaction(async (tx) => {
    const [sessionRow] = await tx
      .select({
        sessionId: sessions.id,
        locationId: sessions.locationId,
        startsAt: sessions.startsAt,
        endsAt: sessions.endsAt,
        status: sessions.status,
      })
      .from(sessions)
      .innerJoin(tenants, eq(sessions.tenantId, tenants.id))
      .where(
        and(
          eq(sessions.id, sessionId),
          eq(sessions.tenantId, session.tenantId!),
          eq(tenants.slug, tenantSlug),
          inArray(sessions.status, [...SCHEDULABLE_SESSION_STATUSES]),
        ),
      )
      .for("update")
      .limit(1);

    if (!sessionRow) {
      throw new AssignSessionStaffError("session_not_found");
    }

    if (!isWithinLocationScope(sessionRow.locationId, assignLocationIds)) {
      throw new AssignSessionStaffError("location_forbidden");
    }

    const [staffMember] = await tx
      .select({ userId: tenantMemberships.userId })
      .from(tenantMemberships)
      .innerJoin(tenants, eq(tenantMemberships.tenantId, tenants.id))
      .where(
        and(
          eq(tenantMemberships.userId, input.userId),
          eq(tenantMemberships.tenantId, session.tenantId!),
          eq(tenantMemberships.status, "active"),
          eq(tenants.slug, tenantSlug),
        ),
      )
      .limit(1);

    if (!staffMember) {
      throw new AssignSessionStaffError("staff_not_found");
    }

    const [existingAssignment] = await tx
      .select({ id: sessionStaffAssignments.id })
      .from(sessionStaffAssignments)
      .where(
        and(
          eq(sessionStaffAssignments.sessionId, sessionId),
          eq(sessionStaffAssignments.userId, input.userId),
        ),
      )
      .limit(1);

    if (existingAssignment) {
      throw new AssignSessionStaffError("already_assigned");
    }

    const conflicts = await validateSession(tx, {
      tenantId: session.tenantId!,
      startsAt: sessionRow.startsAt,
      endsAt: sessionRow.endsAt,
      staffUserIds: [input.userId],
      excludeSessionId: sessionId,
    });

    if (conflicts.length > 0) {
      throw new AssignSessionStaffError(
        "staff_double_book",
        conflicts[0]?.conflictingSessionId,
      );
    }

    const [assignment] = await tx
      .insert(sessionStaffAssignments)
      .values({
        tenantId: session.tenantId!,
        sessionId,
        userId: input.userId,
        role,
      })
      .returning({
        id: sessionStaffAssignments.id,
        sessionId: sessionStaffAssignments.sessionId,
        userId: sessionStaffAssignments.userId,
        role: sessionStaffAssignments.role,
      });

    return {
      assignmentId: assignment.id,
      sessionId: assignment.sessionId,
      userId: assignment.userId,
      role: assignment.role,
    };
  });
}

export type SessionListItem = {
  sessionId: string;
  label: string;
  startsAt: string;
  assignedStaff: string[];
};

export async function listSessionStaffFormOptions(session: SessionContext, tenantSlug: string) {
  if (
    !session.tenantId ||
    !canAssignSessionStaff(session.roles, session.locationIds, session.roleAssignments)
  ) {
    return { sessions: [], staff: [] };
  }

  const assignLocationIds = session.roleAssignments
    ? resolveAssignSessionStaffLocationIds(session.roles, session.roleAssignments)
    : session.locationIds;

  const db = getDb();

  const sessionRows = await db
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
    .where(
      and(
        eq(tenants.slug, tenantSlug),
        eq(sessions.tenantId, session.tenantId),
        inArray(sessions.status, [...SCHEDULABLE_SESSION_STATUSES]),
      ),
    )
    .orderBy(desc(sessions.startsAt));

  const assignmentRows = await db
    .select({
      sessionId: sessionStaffAssignments.sessionId,
      staffName: user.name,
    })
    .from(sessionStaffAssignments)
    .innerJoin(user, eq(sessionStaffAssignments.userId, user.id))
    .where(eq(sessionStaffAssignments.tenantId, session.tenantId));

  const staffBySession = new Map<string, string[]>();

  for (const row of assignmentRows) {
    const existing = staffBySession.get(row.sessionId) ?? [];
    existing.push(row.staffName);
    staffBySession.set(row.sessionId, existing);
  }

  const staffRows = await db
    .select({
      userId: user.id,
      name: user.name,
      email: user.email,
    })
    .from(tenantMemberships)
    .innerJoin(user, eq(tenantMemberships.userId, user.id))
    .innerJoin(tenants, eq(tenantMemberships.tenantId, tenants.id))
    .where(
      and(
        eq(tenants.slug, tenantSlug),
        eq(tenantMemberships.tenantId, session.tenantId),
        eq(tenantMemberships.status, "active"),
      ),
    );

  const filteredSessions = sessionRows
    .filter((row) => isWithinLocationScope(row.locationId, assignLocationIds))
    .map((row) => ({
      sessionId: row.sessionId,
      label: `${row.offerName} · ${row.groupName} · ${row.startsAt.toISOString()}`,
      startsAt: row.startsAt.toISOString(),
      assignedStaff: staffBySession.get(row.sessionId) ?? [],
    }));

  return {
    sessions: filteredSessions,
    staff: staffRows.map((row) => ({
      userId: row.userId,
      label: `${row.name} (${row.email})`,
    })),
  };
}
