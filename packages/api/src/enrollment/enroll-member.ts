import { and, eq, inArray, sql } from "drizzle-orm";
import { getDb } from "@afterhive/db";
import {
  enrollments,
  memberProfiles,
  offerGroups,
  offers,
  persons,
  tenants,
  waitlistEntries,
} from "@afterhive/db/schema";
import type { SessionContext } from "@afterhive/domain";
import { isWithinLocationScope } from "../location/location-scope";
import { canActivateEnrollment } from "./can-activate-enrollment";
import { canEnrollMember, resolveEnrollMemberLocationIds } from "./can-enroll-member";

export type EnrollMemberInput = {
  memberProfileId: string;
  offerGroupId: string;
};

export type EnrollMemberResult =
  | {
      outcome: "enrolled";
      enrollmentId: string;
      status: "active" | "pending";
    }
  | {
      outcome: "waitlisted";
      waitlistEntryId: string;
      position: number;
      status: "waiting";
    };

export class EnrollMemberError extends Error {
  constructor(
    readonly code:
      | "tenant_not_found"
      | "forbidden"
      | "missing_fields"
      | "member_not_found"
      | "offer_group_not_found"
      | "location_forbidden"
      | "group_closed"
      | "group_full"
      | "already_enrolled"
      | "already_waitlisted",
  ) {
    super(code);
    this.name = "EnrollMemberError";
  }
}

const ACTIVE_WAITLIST_STATUSES = ["waiting", "offered", "accepted"] as const;
const ACTIVE_ENROLLMENT_STATUSES = ["pending", "active"] as const;

export function validateEnrollMemberInput(input: EnrollMemberInput) {
  if (typeof input.memberProfileId !== "string" || typeof input.offerGroupId !== "string") {
    return "missing_fields" as const;
  }

  if (!input.memberProfileId.trim() || !input.offerGroupId.trim()) {
    return "missing_fields" as const;
  }

  return null;
}

export async function enrollMember(
  session: SessionContext,
  tenantSlug: string,
  input: EnrollMemberInput,
): Promise<EnrollMemberResult> {
  if (!session.tenantId) {
    throw new EnrollMemberError("tenant_not_found");
  }

  if (!canEnrollMember(session.roles, session.locationIds, session.roleAssignments)) {
    throw new EnrollMemberError("forbidden");
  }

  const validationError = validateEnrollMemberInput(input);
  if (validationError === "missing_fields") {
    throw new EnrollMemberError("missing_fields");
  }

  const enrollLocationIds = session.roleAssignments
    ? resolveEnrollMemberLocationIds(session.roles, session.roleAssignments)
    : session.locationIds;

  const db = getDb();

  return db.transaction(async (tx) => {
    const [group] = await tx
      .select({
        id: offerGroups.id,
        capacity: offerGroups.capacity,
        enrolledCount: offerGroups.enrolledCount,
        waitlistEnabled: offerGroups.waitlistEnabled,
        locationId: offerGroups.locationId,
        status: offerGroups.status,
      })
      .from(offerGroups)
      .innerJoin(tenants, eq(offerGroups.tenantId, tenants.id))
      .where(
        and(
          eq(offerGroups.id, input.offerGroupId),
          eq(offerGroups.tenantId, session.tenantId!),
          eq(tenants.slug, tenantSlug),
        ),
      )
      .for("update")
      .limit(1);

    if (!group) {
      throw new EnrollMemberError("offer_group_not_found");
    }

    if (!isWithinLocationScope(group.locationId, enrollLocationIds)) {
      throw new EnrollMemberError("location_forbidden");
    }

    if (group.status === "closed") {
      throw new EnrollMemberError("group_closed");
    }

    const [member] = await tx
      .select({
        id: memberProfiles.id,
        consentStatus: memberProfiles.consentStatus,
        dateOfBirth: persons.dateOfBirth,
      })
      .from(memberProfiles)
      .innerJoin(persons, eq(memberProfiles.personId, persons.id))
      .where(
        and(
          eq(memberProfiles.id, input.memberProfileId),
          eq(memberProfiles.tenantId, session.tenantId!),
        ),
      )
      .limit(1);

    if (!member) {
      throw new EnrollMemberError("member_not_found");
    }

    const [existingEnrollment] = await tx
      .select({ id: enrollments.id })
      .from(enrollments)
      .where(
        and(
          eq(enrollments.tenantId, session.tenantId!),
          eq(enrollments.memberProfileId, input.memberProfileId),
          eq(enrollments.offerGroupId, input.offerGroupId),
          inArray(enrollments.status, [...ACTIVE_ENROLLMENT_STATUSES]),
        ),
      )
      .limit(1);

    if (existingEnrollment) {
      throw new EnrollMemberError("already_enrolled");
    }

    const [existingWaitlist] = await tx
      .select({ id: waitlistEntries.id })
      .from(waitlistEntries)
      .where(
        and(
          eq(waitlistEntries.tenantId, session.tenantId!),
          eq(waitlistEntries.memberProfileId, input.memberProfileId),
          eq(waitlistEntries.offerGroupId, input.offerGroupId),
          inArray(waitlistEntries.status, [...ACTIVE_WAITLIST_STATUSES]),
        ),
      )
      .limit(1);

    if (existingWaitlist) {
      throw new EnrollMemberError("already_waitlisted");
    }

    if (group.enrolledCount < group.capacity) {
      const enrollmentDate = new Date();
      const canActivate = canActivateEnrollment({
        dateOfBirth: member.dateOfBirth ? new Date(member.dateOfBirth) : null,
        consentStatus: member.consentStatus as "pending" | "complete",
        enrollmentDate,
      });

      if (canActivate) {
        const [enrollment] = await tx
          .insert(enrollments)
          .values({
            tenantId: session.tenantId!,
            memberProfileId: input.memberProfileId,
            offerGroupId: input.offerGroupId,
            status: "active",
            activatedAt: enrollmentDate,
          })
          .returning({ id: enrollments.id });

        const nextEnrolledCount = group.enrolledCount + 1;

        await tx
          .update(offerGroups)
          .set({
            enrolledCount: nextEnrolledCount,
            ...(nextEnrolledCount >= group.capacity ? { status: "full" as const } : {}),
          })
          .where(eq(offerGroups.id, group.id));

        return {
          outcome: "enrolled",
          enrollmentId: enrollment.id,
          status: "active",
        };
      }

      const [enrollment] = await tx
        .insert(enrollments)
        .values({
          tenantId: session.tenantId!,
          memberProfileId: input.memberProfileId,
          offerGroupId: input.offerGroupId,
          status: "pending",
        })
        .returning({ id: enrollments.id });

      return {
        outcome: "enrolled",
        enrollmentId: enrollment.id,
        status: "pending",
      };
    }

    if (!group.waitlistEnabled) {
      throw new EnrollMemberError("group_full");
    }

    const [positionRow] = await tx
      .select({
        maxPosition: sql<number>`coalesce(max(${waitlistEntries.position}), 0)`,
      })
      .from(waitlistEntries)
      .where(eq(waitlistEntries.offerGroupId, group.id));

    const position = Number(positionRow?.maxPosition ?? 0) + 1;

    const [waitlistEntry] = await tx
      .insert(waitlistEntries)
      .values({
        tenantId: session.tenantId!,
        offerGroupId: group.id,
        memberProfileId: input.memberProfileId,
        position,
        status: "waiting",
      })
      .returning({
        id: waitlistEntries.id,
        position: waitlistEntries.position,
      });

    return {
      outcome: "waitlisted",
      waitlistEntryId: waitlistEntry.id,
      position: waitlistEntry.position,
      status: "waiting",
    };
  });
}

export type EnrollOfferGroupOption = {
  offerGroupId: string;
  label: string;
  capacity: number;
  enrolledCount: number;
  waitlistEnabled: boolean;
};

export type EnrollMemberOption = {
  memberProfileId: string;
  label: string;
};

export async function listEnrollFormOptions(session: SessionContext, tenantSlug: string) {
  if (!session.tenantId || !canEnrollMember(session.roles, session.locationIds, session.roleAssignments)) {
    return { offerGroups: [], members: [] };
  }

  const enrollLocationIds = session.roleAssignments
    ? resolveEnrollMemberLocationIds(session.roles, session.roleAssignments)
    : session.locationIds;

  const db = getDb();
  const groupConditions = [eq(tenants.slug, tenantSlug), eq(offerGroups.tenantId, session.tenantId)];

  if (enrollLocationIds !== undefined) {
    if (enrollLocationIds.length === 0) {
      return { offerGroups: [], members: [] };
    }
    groupConditions.push(inArray(offerGroups.locationId, enrollLocationIds));
  }

  const groupRows = await db
    .select({
      offerGroupId: offerGroups.id,
      groupName: offerGroups.name,
      offerName: offers.name,
      capacity: offerGroups.capacity,
      enrolledCount: offerGroups.enrolledCount,
      waitlistEnabled: offerGroups.waitlistEnabled,
    })
    .from(offerGroups)
    .innerJoin(offers, eq(offerGroups.offerId, offers.id))
    .innerJoin(tenants, eq(offerGroups.tenantId, tenants.id))
    .where(and(...groupConditions));

  const memberRows = await db
    .select({
      memberProfileId: memberProfiles.id,
      memberNumber: memberProfiles.memberNumber,
      firstName: persons.firstName,
      lastName: persons.lastName,
    })
    .from(memberProfiles)
    .innerJoin(persons, eq(memberProfiles.personId, persons.id))
    .innerJoin(tenants, eq(memberProfiles.tenantId, tenants.id))
    .where(and(eq(tenants.slug, tenantSlug), eq(memberProfiles.tenantId, session.tenantId)));

  return {
    offerGroups: groupRows.map((row) => ({
      offerGroupId: row.offerGroupId,
      label: `${row.offerName} · ${row.groupName} · ${row.enrolledCount}/${row.capacity}`,
      capacity: row.capacity,
      enrolledCount: row.enrolledCount,
      waitlistEnabled: row.waitlistEnabled,
    })),
    members: memberRows.map((row) => ({
      memberProfileId: row.memberProfileId,
      label: `${row.firstName} ${row.lastName} (${row.memberNumber})`,
    })),
  };
}
