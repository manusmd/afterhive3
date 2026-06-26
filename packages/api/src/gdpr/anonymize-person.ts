import { and, eq, isNull } from "drizzle-orm";
import { getDb } from "@afterhive/db";
import { auditLogEntries, leads, memberProfiles, persons, tenants } from "@afterhive/db/schema";
import type { SessionContext } from "@afterhive/domain";
import {
  buildLocationScopeFilter,
  hasAllLocationsAccess,
  hasNoLocationAccess,
} from "../location/location-scope";
import { resolveSessionAnonymizeLocationIds } from "./can-anonymize-person";

export const ANONYMIZED_FIRST_NAME = "Anonymisiert";
export const ANONYMIZED_LAST_NAME = "Person";

const ANONYMIZE_REDACTED_FIELDS = ["firstName", "lastName", "dateOfBirth", "userId"] as const;

export type AnonymizePersonResult = {
  personId: string;
  anonymizedAt: string;
  anonymizedLeadIds: string[];
};

export class AnonymizePersonError extends Error {
  constructor(
    readonly code:
      | "tenant_not_found"
      | "person_not_found"
      | "already_anonymized"
      | "location_forbidden",
  ) {
    super(code);
    this.name = "AnonymizePersonError";
  }
}

async function assertPersonAnonymizeScope(
  tenantId: string,
  personId: string,
  anonymizeLocationIds: string[] | undefined,
) {
  if (hasAllLocationsAccess(anonymizeLocationIds)) {
    return;
  }

  if (hasNoLocationAccess(anonymizeLocationIds)) {
    throw new AnonymizePersonError("location_forbidden");
  }

  const db = getDb();
  const scopeFilter = buildLocationScopeFilter(leads.locationId, anonymizeLocationIds);
  const conditions = [eq(leads.tenantId, tenantId), eq(leads.convertedPersonId, personId)];

  if (scopeFilter) {
    conditions.push(scopeFilter);
  }

  const [lead] = await db
    .select({ id: leads.id })
    .from(leads)
    .where(and(...conditions))
    .limit(1);

  if (!lead) {
    throw new AnonymizePersonError("location_forbidden");
  }
}

export async function anonymizePerson(
  session: SessionContext,
  tenantSlug: string,
  personId: string,
): Promise<AnonymizePersonResult> {
  if (!session.tenantId || !session.userId) {
    throw new AnonymizePersonError("tenant_not_found");
  }

  const anonymizeLocationIds = resolveSessionAnonymizeLocationIds(session);
  await assertPersonAnonymizeScope(session.tenantId, personId, anonymizeLocationIds);

  const db = getDb();
  const anonymizedAt = new Date();

  return db.transaction(async (tx) => {
    const [person] = await tx
      .select({
        id: persons.id,
        deletedAt: persons.deletedAt,
      })
      .from(persons)
      .innerJoin(tenants, eq(persons.tenantId, tenants.id))
      .where(
        and(
          eq(persons.id, personId),
          eq(persons.tenantId, session.tenantId!),
          eq(tenants.slug, tenantSlug),
        ),
      )
      .for("update")
      .limit(1);

    if (!person) {
      throw new AnonymizePersonError("person_not_found");
    }

    if (person.deletedAt) {
      throw new AnonymizePersonError("already_anonymized");
    }

    const [memberProfile] = await tx
      .select({ id: memberProfiles.id })
      .from(memberProfiles)
      .where(
        and(eq(memberProfiles.tenantId, session.tenantId!), eq(memberProfiles.personId, personId)),
      )
      .limit(1);

    const anonymizedLeads = await tx
      .update(leads)
      .set({
        firstName: ANONYMIZED_FIRST_NAME,
        lastName: ANONYMIZED_LAST_NAME,
      })
      .where(and(eq(leads.tenantId, session.tenantId!), eq(leads.convertedPersonId, personId)))
      .returning({ id: leads.id });

    const [updatedPerson] = await tx
      .update(persons)
      .set({
        firstName: ANONYMIZED_FIRST_NAME,
        lastName: ANONYMIZED_LAST_NAME,
        dateOfBirth: null,
        userId: null,
        deletedAt: anonymizedAt,
      })
      .where(and(eq(persons.id, personId), isNull(persons.deletedAt)))
      .returning({ id: persons.id });

    if (!updatedPerson) {
      throw new AnonymizePersonError("already_anonymized");
    }

    await tx.insert(auditLogEntries).values({
      tenantId: session.tenantId!,
      actorUserId: session.userId!,
      action: "person.anonymize",
      entityType: "person",
      entityId: personId,
      before: {
        personId,
        redactedFields: [...ANONYMIZE_REDACTED_FIELDS],
      },
      after: {
        personId,
        anonymizedAt: anonymizedAt.toISOString(),
        anonymizedLeadIds: anonymizedLeads.map((lead) => lead.id),
        memberProfileRetained: memberProfile?.id ?? null,
      },
    });

    return {
      personId,
      anonymizedAt: anonymizedAt.toISOString(),
      anonymizedLeadIds: anonymizedLeads.map((lead) => lead.id),
    };
  });
}
