import { and, eq } from "drizzle-orm";
import { getDb } from "@afterhive/db";
import {
  offerGroups,
  recurrenceRules,
  sessions,
  tenants,
} from "@afterhive/db/schema";
import { buildWeeklySessionOccurrences } from "./build-weekly-sessions";

export type GenerateSessionsInput = {
  tenantId: string;
  tenantSlug: string;
  offerGroupId: string;
  maxOccurrences: number;
};

export class GenerateSessionsError extends Error {
  constructor(
    readonly code:
      | "tenant_not_found"
      | "offer_group_not_found"
      | "recurrence_not_found"
      | "invalid_recurrence",
  ) {
    super(code);
    this.name = "GenerateSessionsError";
  }
}

type DbClient = ReturnType<typeof getDb>;

export async function generateSessions(
  db: DbClient,
  input: GenerateSessionsInput,
): Promise<number> {
  const [tenant] = await db
    .select({ id: tenants.id })
    .from(tenants)
    .where(and(eq(tenants.id, input.tenantId), eq(tenants.slug, input.tenantSlug)))
    .limit(1);

  if (!tenant) {
    throw new GenerateSessionsError("tenant_not_found");
  }

  const [group] = await db
    .select({
      id: offerGroups.id,
      locationId: offerGroups.locationId,
    })
    .from(offerGroups)
    .where(and(eq(offerGroups.id, input.offerGroupId), eq(offerGroups.tenantId, input.tenantId)))
    .limit(1);

  if (!group) {
    throw new GenerateSessionsError("offer_group_not_found");
  }

  const [rule] = await db
    .select({
      rrule: recurrenceRules.rrule,
      dtstart: recurrenceRules.dtstart,
      durationMinutes: recurrenceRules.durationMinutes,
    })
    .from(recurrenceRules)
    .where(
      and(
        eq(recurrenceRules.offerGroupId, input.offerGroupId),
        eq(recurrenceRules.tenantId, input.tenantId),
      ),
    )
    .limit(1);

  if (!rule) {
    throw new GenerateSessionsError("recurrence_not_found");
  }

  const occurrences = buildWeeklySessionOccurrences({
    dtstart: rule.dtstart,
    durationMinutes: rule.durationMinutes,
    rrule: rule.rrule,
    maxOccurrences: input.maxOccurrences,
  });

  if (occurrences.length === 0) {
    throw new GenerateSessionsError("invalid_recurrence");
  }

  await db.insert(sessions).values(
    occurrences.map((occurrence) => ({
      tenantId: input.tenantId,
      offerGroupId: group.id,
      locationId: group.locationId,
      startsAt: occurrence.startsAt,
      endsAt: occurrence.endsAt,
      status: "scheduled" as const,
    })),
  );

  return occurrences.length;
}
