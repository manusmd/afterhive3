import { and, desc, eq, inArray } from "drizzle-orm";
import { getDb } from "@afterhive/db";
import {
  enrollments,
  memberProfiles,
  offerGroups,
  offers,
  persons,
  tenants,
} from "@afterhive/db/schema";
import type { SessionContext } from "@afterhive/domain";
import { isWithinLocationScope } from "../location/location-scope";
import { canEndEnrollment, resolveEndEnrollmentLocationIds } from "./can-end-enrollment";

export type EnrollmentListItem = {
  enrollmentId: string;
  memberLabel: string;
  offerGroupLabel: string;
  status: string;
  enrolledAt: string;
};

const ENDABLE_STATUSES = ["active"] as const;

export async function listEnrollments(
  session: SessionContext,
  tenantSlug: string,
): Promise<EnrollmentListItem[]> {
  if (!session.tenantId || !canEndEnrollment(session.roles, session.locationIds, session.roleAssignments)) {
    return [];
  }

  const endLocationIds = session.roleAssignments
    ? resolveEndEnrollmentLocationIds(session.roles, session.roleAssignments)
    : session.locationIds;

  const db = getDb();
  const rows = await db
    .select({
      enrollmentId: enrollments.id,
      status: enrollments.status,
      enrolledAt: enrollments.enrolledAt,
      memberNumber: memberProfiles.memberNumber,
      firstName: persons.firstName,
      lastName: persons.lastName,
      offerName: offers.name,
      groupName: offerGroups.name,
      locationId: offerGroups.locationId,
    })
    .from(enrollments)
    .innerJoin(memberProfiles, eq(enrollments.memberProfileId, memberProfiles.id))
    .innerJoin(persons, eq(memberProfiles.personId, persons.id))
    .innerJoin(offerGroups, eq(enrollments.offerGroupId, offerGroups.id))
    .innerJoin(offers, eq(offerGroups.offerId, offers.id))
    .innerJoin(tenants, eq(enrollments.tenantId, tenants.id))
    .where(
      and(
        eq(tenants.slug, tenantSlug),
        eq(enrollments.tenantId, session.tenantId),
        inArray(enrollments.status, [...ENDABLE_STATUSES]),
      ),
    )
    .orderBy(desc(enrollments.enrolledAt));

  return rows
    .filter((row) => isWithinLocationScope(row.locationId, endLocationIds))
    .map((row) => ({
      enrollmentId: row.enrollmentId,
      memberLabel: `${row.firstName} ${row.lastName} (${row.memberNumber})`,
      offerGroupLabel: `${row.offerName} · ${row.groupName}`,
      status: row.status,
      enrolledAt: row.enrolledAt.toISOString(),
    }));
}
