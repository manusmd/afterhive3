import { and, eq } from "drizzle-orm";
import { getDb } from "@afterhive/db";
import { enrollments, memberProfiles, offerGroups, persons, tenants } from "@afterhive/db/schema";
import type { SessionContext } from "@afterhive/domain";
import { canActivateEnrollment } from "./can-activate-enrollment";

export type ActivateEnrollmentResult = {
  enrollmentId: string;
  status: string;
  activatedAt: string;
};

export class ActivateEnrollmentError extends Error {
  constructor(
    readonly code:
      | "tenant_not_found"
      | "enrollment_not_found"
      | "invalid_status"
      | "consent_required"
      | "group_full",
  ) {
    super(code);
    this.name = "ActivateEnrollmentError";
  }
}

export async function activateEnrollment(
  session: SessionContext,
  tenantSlug: string,
  enrollmentId: string,
): Promise<ActivateEnrollmentResult> {
  if (!session.tenantId) {
    throw new ActivateEnrollmentError("tenant_not_found");
  }

  const db = getDb();
  const activationDate = new Date();

  return db.transaction(async (tx) => {
    const [row] = await tx
      .select({
        enrollmentId: enrollments.id,
        offerGroupId: enrollments.offerGroupId,
        enrollmentStatus: enrollments.status,
        enrolledAt: enrollments.enrolledAt,
        consentStatus: memberProfiles.consentStatus,
        dateOfBirth: persons.dateOfBirth,
      })
      .from(enrollments)
      .innerJoin(memberProfiles, eq(enrollments.memberProfileId, memberProfiles.id))
      .innerJoin(persons, eq(memberProfiles.personId, persons.id))
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
      throw new ActivateEnrollmentError("enrollment_not_found");
    }

    if (row.enrollmentStatus !== "pending") {
      throw new ActivateEnrollmentError("invalid_status");
    }

    const dateOfBirth = row.dateOfBirth ? new Date(row.dateOfBirth) : null;

    if (
      !canActivateEnrollment({
        dateOfBirth,
        consentStatus: row.consentStatus as "pending" | "complete",
        enrollmentDate: row.enrolledAt,
      })
    ) {
      throw new ActivateEnrollmentError("consent_required");
    }

    const [group] = await tx
      .select({
        capacity: offerGroups.capacity,
        enrolledCount: offerGroups.enrolledCount,
      })
      .from(offerGroups)
      .where(eq(offerGroups.id, row.offerGroupId))
      .for("update")
      .limit(1);

    if (!group || group.enrolledCount >= group.capacity) {
      throw new ActivateEnrollmentError("group_full");
    }

    const [updated] = await tx
      .update(enrollments)
      .set({
        status: "active",
        activatedAt: activationDate,
      })
      .where(and(eq(enrollments.id, enrollmentId), eq(enrollments.status, "pending")))
      .returning({
        id: enrollments.id,
        status: enrollments.status,
        activatedAt: enrollments.activatedAt,
      });

    if (!updated?.activatedAt) {
      throw new ActivateEnrollmentError("invalid_status");
    }

    const nextEnrolledCount = group.enrolledCount + 1;

    await tx
      .update(offerGroups)
      .set({
        enrolledCount: nextEnrolledCount,
        ...(nextEnrolledCount >= group.capacity ? { status: "full" as const } : {}),
      })
      .where(eq(offerGroups.id, row.offerGroupId));

    return {
      enrollmentId: updated.id,
      status: updated.status,
      activatedAt: updated.activatedAt.toISOString(),
    };
  });
}
