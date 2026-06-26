import { and, eq, isNull } from "drizzle-orm";
import { getDb } from "@afterhive/db";
import { auditLogEntries, leads, memberProfiles, persons, tenants } from "@afterhive/db/schema";
import type { SessionContext } from "@afterhive/domain";

export const ANONYMIZED_FIRST_NAME = "Anonymisiert";
export const ANONYMIZED_LAST_NAME = "Person";

export type AnonymizePersonResult = {
  personId: string;
  anonymizedAt: string;
  anonymizedLeadIds: string[];
};

export class AnonymizePersonError extends Error {
  constructor(
    readonly code: "tenant_not_found" | "person_not_found" | "already_anonymized",
  ) {
    super(code);
    this.name = "AnonymizePersonError";
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

  const db = getDb();
  const anonymizedAt = new Date();

  return db.transaction(async (tx) => {
    const [person] = await tx
      .select({
        id: persons.id,
        firstName: persons.firstName,
        lastName: persons.lastName,
        dateOfBirth: persons.dateOfBirth,
        userId: persons.userId,
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
        firstName: person.firstName,
        lastName: person.lastName,
        dateOfBirth: person.dateOfBirth,
        userId: person.userId,
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
