import { and, eq, isNull } from "drizzle-orm";
import { getDb } from "@afterhive/db";
import { auditLogEntries, leads, persons, tenants } from "@afterhive/db/schema";
import type { SessionContext } from "@afterhive/domain";

export type MergePersonsInput = {
  winnerId: string;
  loserId: string;
};

export type MergePersonsResult = {
  personId: string;
  repointedLeadIds: string[];
  mergedAt: string;
};

export class MergePersonsError extends Error {
  constructor(
    readonly code:
      | "tenant_not_found"
      | "same_person"
      | "person_not_found"
      | "already_deleted",
  ) {
    super(code);
    this.name = "MergePersonsError";
  }
}

export async function mergePersons(
  session: SessionContext,
  tenantSlug: string,
  input: MergePersonsInput,
): Promise<MergePersonsResult> {
  if (!session.tenantId || !session.userId) {
    throw new MergePersonsError("tenant_not_found");
  }

  if (input.winnerId === input.loserId) {
    throw new MergePersonsError("same_person");
  }

  const db = getDb();
  const mergedAt = new Date();

  return db.transaction(async (tx) => {
    const [winner] = await tx
      .select({
        id: persons.id,
        firstName: persons.firstName,
        lastName: persons.lastName,
        deletedAt: persons.deletedAt,
      })
      .from(persons)
      .innerJoin(tenants, eq(persons.tenantId, tenants.id))
      .where(
        and(
          eq(persons.id, input.winnerId),
          eq(persons.tenantId, session.tenantId!),
          eq(tenants.slug, tenantSlug),
          isNull(persons.deletedAt),
        ),
      )
      .for("update")
      .limit(1);

    const [loser] = await tx
      .select({
        id: persons.id,
        firstName: persons.firstName,
        lastName: persons.lastName,
        deletedAt: persons.deletedAt,
      })
      .from(persons)
      .innerJoin(tenants, eq(persons.tenantId, tenants.id))
      .where(
        and(
          eq(persons.id, input.loserId),
          eq(persons.tenantId, session.tenantId!),
          eq(tenants.slug, tenantSlug),
        ),
      )
      .for("update")
      .limit(1);

    if (!winner || !loser) {
      throw new MergePersonsError("person_not_found");
    }

    if (loser.deletedAt) {
      throw new MergePersonsError("already_deleted");
    }

    const repointedLeads = await tx
      .update(leads)
      .set({ convertedPersonId: winner.id })
      .where(
        and(eq(leads.tenantId, session.tenantId!), eq(leads.convertedPersonId, loser.id)),
      )
      .returning({ id: leads.id });

    const [deletedLoser] = await tx
      .update(persons)
      .set({ deletedAt: mergedAt })
      .where(and(eq(persons.id, loser.id), isNull(persons.deletedAt)))
      .returning({ id: persons.id });

    if (!deletedLoser) {
      throw new MergePersonsError("already_deleted");
    }

    await tx.insert(auditLogEntries).values({
      tenantId: session.tenantId!,
      actorUserId: session.userId!,
      action: "person.merge",
      entityType: "person",
      entityId: winner.id,
      before: {
        winnerId: winner.id,
        loserId: loser.id,
        loser: {
          firstName: loser.firstName,
          lastName: loser.lastName,
        },
      },
      after: {
        winnerId: winner.id,
        repointedLeadIds: repointedLeads.map((lead) => lead.id),
        mergedAt: mergedAt.toISOString(),
      },
    });

    return {
      personId: winner.id,
      repointedLeadIds: repointedLeads.map((lead) => lead.id),
      mergedAt: mergedAt.toISOString(),
    };
  });
}
