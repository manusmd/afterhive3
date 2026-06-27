import { and, eq } from "drizzle-orm";
import { getDb } from "@afterhive/db";
import { enrollments, offerGroups, tenants } from "@afterhive/db/schema";
import type { SessionContext } from "@afterhive/domain";
import { isWithinLocationScope } from "../location/location-scope";
import { canEndEnrollment, resolveEndEnrollmentLocationIds } from "./can-end-enrollment";

export type EndEnrollmentReason = "completed" | "canceled" | "transferred";

export type EndEnrollmentInput = {
  reason?: EndEnrollmentReason;
};

export type EndEnrollmentResult = {
  enrollmentId: string;
  status: "ended";
  endedAt: string;
  endReason: EndEnrollmentReason;
};

export class EndEnrollmentError extends Error {
  constructor(
    readonly code:
      | "tenant_not_found"
      | "forbidden"
      | "enrollment_not_found"
      | "location_forbidden"
      | "invalid_status"
      | "invalid_reason",
  ) {
    super(code);
    this.name = "EndEnrollmentError";
  }
}

const END_REASONS = new Set<EndEnrollmentReason>(["completed", "canceled", "transferred"]);

export function validateEndEnrollmentInput(input: EndEnrollmentInput) {
  if (input.reason === undefined) {
    return null;
  }

  if (typeof input.reason !== "string" || !END_REASONS.has(input.reason)) {
    return "invalid_reason" as const;
  }

  return null;
}

export async function endEnrollment(
  session: SessionContext,
  tenantSlug: string,
  enrollmentId: string,
  input: EndEnrollmentInput = {},
): Promise<EndEnrollmentResult> {
  if (!session.tenantId) {
    throw new EndEnrollmentError("tenant_not_found");
  }

  if (!canEndEnrollment(session.roles, session.locationIds, session.roleAssignments)) {
    throw new EndEnrollmentError("forbidden");
  }

  const validationError = validateEndEnrollmentInput(input);
  if (validationError === "invalid_reason") {
    throw new EndEnrollmentError("invalid_reason");
  }

  const endLocationIds = session.roleAssignments
    ? resolveEndEnrollmentLocationIds(session.roles, session.roleAssignments)
    : session.locationIds;

  const db = getDb();
  const endedAt = new Date();
  const endReason = input.reason ?? "completed";

  return db.transaction(async (tx) => {
    const [row] = await tx
      .select({
        enrollmentId: enrollments.id,
        offerGroupId: enrollments.offerGroupId,
        enrollmentStatus: enrollments.status,
        locationId: offerGroups.locationId,
      })
      .from(enrollments)
      .innerJoin(offerGroups, eq(enrollments.offerGroupId, offerGroups.id))
      .innerJoin(tenants, eq(enrollments.tenantId, tenants.id))
      .where(
        and(
          eq(enrollments.id, enrollmentId),
          eq(enrollments.tenantId, session.tenantId!),
          eq(tenants.slug, tenantSlug),
        ),
      )
      .for("update")
      .limit(1);

    if (!row) {
      throw new EndEnrollmentError("enrollment_not_found");
    }

    if (!isWithinLocationScope(row.locationId, endLocationIds)) {
      throw new EndEnrollmentError("location_forbidden");
    }

    if (row.enrollmentStatus !== "active") {
      throw new EndEnrollmentError("invalid_status");
    }

    const [group] = await tx
      .select({
        capacity: offerGroups.capacity,
        enrolledCount: offerGroups.enrolledCount,
        status: offerGroups.status,
      })
      .from(offerGroups)
      .where(eq(offerGroups.id, row.offerGroupId))
      .for("update")
      .limit(1);

    if (!group) {
      throw new EndEnrollmentError("enrollment_not_found");
    }

    const [updated] = await tx
      .update(enrollments)
      .set({
        status: "ended",
        endedAt,
        endReason,
      })
      .where(and(eq(enrollments.id, enrollmentId), eq(enrollments.status, "active")))
      .returning({
        id: enrollments.id,
        status: enrollments.status,
        endedAt: enrollments.endedAt,
        endReason: enrollments.endReason,
      });

    if (!updated?.endedAt || !updated.endReason) {
      throw new EndEnrollmentError("invalid_status");
    }

    const nextEnrolledCount = Math.max(0, group.enrolledCount - 1);

    await tx
      .update(offerGroups)
      .set({
        enrolledCount: nextEnrolledCount,
        ...(group.status === "full" && nextEnrolledCount < group.capacity
          ? { status: "open" as const }
          : {}),
      })
      .where(eq(offerGroups.id, row.offerGroupId));

    return {
      enrollmentId: updated.id,
      status: "ended",
      endedAt: updated.endedAt.toISOString(),
      endReason: updated.endReason,
    };
  });
}
