import { randomUUID } from "node:crypto";
import { and, eq } from "drizzle-orm";
import { getDb } from "@afterhive/db";
import {
  locations,
  offerGroups,
  offers,
  recurrenceRules,
  sessions,
  tenants,
} from "@afterhive/db/schema";
import type { SessionContext } from "@afterhive/domain";
import { listTenantLocations } from "../auth/tenant-locations";
import { isWithinLocationScope } from "../location/location-scope";
import { canCreateOffer, resolveOfferCreateLocationIds } from "./can-create-offer";
import { buildWeeklySessionOccurrences, isValidWeeklySingleDayRrule } from "../schedule/build-weekly-sessions";
import { isValidTimeZone, parseLocalDateTimeInTimeZone } from "../schedule/timezone";

export type CreateOfferInput = {
  name: string;
  description?: string;
  type: "team" | "course" | "workshop" | "subscription";
  locationId: string;
  groupName: string;
  capacity: number;
  recurrence: {
    dtstart: string;
    durationMinutes: number;
    rrule: string;
    timezone: string;
    generateWeeks: number;
  };
};

export type CreateOfferResult = {
  offerId: string;
  offerGroupId: string;
  recurrenceRuleId: string;
  sessionCount: number;
};

const OFFER_TYPES = ["team", "course", "workshop", "subscription"] as const;

export class CreateOfferError extends Error {
  constructor(
    readonly code:
      | "tenant_not_found"
      | "forbidden"
      | "missing_fields"
      | "invalid_type"
      | "invalid_location"
      | "location_forbidden"
      | "invalid_capacity"
      | "invalid_recurrence"
      | "session_generation_failed",
  ) {
    super(code);
    this.name = "CreateOfferError";
  }
}

const MAX_NAME_LENGTH = 255;
const DEFAULT_TIMEZONE = "Europe/Berlin";
const MAX_GENERATE_WEEKS = 52;

function addWeeks(date: Date, weeks: number) {
  const result = new Date(date);
  result.setUTCDate(result.getUTCDate() + weeks * 7);
  return result;
}

export function validateCreateOfferInput(input: CreateOfferInput) {
  if (
    typeof input.name !== "string" ||
    typeof input.groupName !== "string" ||
    typeof input.locationId !== "string" ||
    typeof input.type !== "string" ||
    !input.recurrence ||
    typeof input.recurrence.dtstart !== "string" ||
    typeof input.recurrence.rrule !== "string" ||
    typeof input.recurrence.timezone !== "string"
  ) {
    return "missing_fields" as const;
  }

  if (
    !input.name.trim() ||
    !input.groupName.trim() ||
    !Number.isInteger(input.capacity) ||
    input.capacity < 1 ||
    !Number.isInteger(input.recurrence.durationMinutes) ||
    input.recurrence.durationMinutes < 1 ||
    !Number.isInteger(input.recurrence.generateWeeks) ||
    input.recurrence.generateWeeks < 1 ||
    input.recurrence.generateWeeks > MAX_GENERATE_WEEKS
  ) {
    return "missing_fields" as const;
  }

  if (!(OFFER_TYPES as readonly string[]).includes(input.type)) {
    return "invalid_type" as const;
  }

  if (input.name.length > MAX_NAME_LENGTH || input.groupName.length > MAX_NAME_LENGTH) {
    return "missing_fields" as const;
  }

  const timezone = input.recurrence.timezone.trim() || DEFAULT_TIMEZONE;
  if (!isValidTimeZone(timezone)) {
    return "invalid_recurrence" as const;
  }

  const dtstart = parseLocalDateTimeInTimeZone(input.recurrence.dtstart, timezone);
  if (!dtstart) {
    return "invalid_recurrence" as const;
  }

  if (!isValidWeeklySingleDayRrule(input.recurrence.rrule)) {
    return "invalid_recurrence" as const;
  }

  return null;
}

export async function listOfferFormLocations(session: SessionContext, tenantSlug: string) {
  const locations = await listTenantLocations(tenantSlug);
  const createLocationIds = session.roleAssignments
    ? resolveOfferCreateLocationIds(session.roles, session.roleAssignments)
    : session.locationIds;

  if (createLocationIds === undefined) {
    return locations;
  }

  if (createLocationIds.length === 0) {
    return [];
  }

  return locations.filter((location) => createLocationIds.includes(location.id));
}

export async function createOffer(
  session: SessionContext,
  tenantSlug: string,
  input: CreateOfferInput,
): Promise<CreateOfferResult> {
  if (!session.tenantId) {
    throw new CreateOfferError("tenant_not_found");
  }

  if (!canCreateOffer(session.roles, session.locationIds, session.roleAssignments)) {
    throw new CreateOfferError("forbidden");
  }

  const validationError = validateCreateOfferInput(input);
  if (validationError === "missing_fields") {
    throw new CreateOfferError("missing_fields");
  }
  if (validationError === "invalid_type") {
    throw new CreateOfferError("invalid_type");
  }
  if (validationError === "invalid_recurrence") {
    throw new CreateOfferError("invalid_recurrence");
  }

  const tenantLocations = await listTenantLocations(tenantSlug);
  const location = tenantLocations.find((entry) => entry.id === input.locationId);
  if (!location) {
    throw new CreateOfferError("invalid_location");
  }

  const createLocationIds = session.roleAssignments
    ? resolveOfferCreateLocationIds(session.roles, session.roleAssignments)
    : session.locationIds;

  if (!isWithinLocationScope(input.locationId, createLocationIds)) {
    throw new CreateOfferError("location_forbidden");
  }

  const db = getDb();
  const offerId = randomUUID();
  const offerGroupId = randomUUID();
  const recurrenceRuleId = randomUUID();
  const timezone = input.recurrence.timezone.trim() || DEFAULT_TIMEZONE;
  const dtstart = parseLocalDateTimeInTimeZone(input.recurrence.dtstart, timezone);
  if (!dtstart) {
    throw new CreateOfferError("invalid_recurrence");
  }

  const rangeEnd = addWeeks(dtstart, input.recurrence.generateWeeks);

  return db.transaction(async (tx) => {
    const [tenant] = await tx
      .select({ id: tenants.id })
      .from(tenants)
      .where(and(eq(tenants.id, session.tenantId!), eq(tenants.slug, tenantSlug)))
      .limit(1);

    if (!tenant) {
      throw new CreateOfferError("tenant_not_found");
    }

    const [locationRow] = await tx
      .select({ id: locations.id })
      .from(locations)
      .where(and(eq(locations.id, input.locationId), eq(locations.tenantId, session.tenantId!)))
      .limit(1);

    if (!locationRow) {
      throw new CreateOfferError("invalid_location");
    }

    await tx.insert(offers).values({
      id: offerId,
      tenantId: session.tenantId!,
      name: input.name.trim(),
      description: input.description?.trim() || null,
      type: input.type,
      vertical: "core",
      locationId: input.locationId,
      status: "draft",
      capacityDefault: input.capacity,
    });

    await tx.insert(offerGroups).values({
      id: offerGroupId,
      tenantId: session.tenantId!,
      offerId,
      name: input.groupName.trim(),
      capacity: input.capacity,
      enrolledCount: 0,
      waitlistEnabled: false,
      locationId: input.locationId,
      status: "open",
    });

    await tx.insert(recurrenceRules).values({
      id: recurrenceRuleId,
      tenantId: session.tenantId!,
      offerGroupId,
      rrule: input.recurrence.rrule.trim(),
      timezone,
      dtstart,
      until: rangeEnd,
      durationMinutes: input.recurrence.durationMinutes,
    });

    const occurrences = buildWeeklySessionOccurrences({
      dtstart,
      durationMinutes: input.recurrence.durationMinutes,
      rrule: input.recurrence.rrule.trim(),
      maxOccurrences: input.recurrence.generateWeeks,
      timezone,
    });

    if (occurrences.length === 0) {
      throw new CreateOfferError("session_generation_failed");
    }

    await tx.insert(sessions).values(
      occurrences.map((occurrence) => ({
        tenantId: session.tenantId!,
        offerGroupId,
        locationId: input.locationId,
        startsAt: occurrence.startsAt,
        endsAt: occurrence.endsAt,
        status: "scheduled" as const,
      })),
    );

    return {
      offerId,
      offerGroupId,
      recurrenceRuleId,
      sessionCount: occurrences.length,
    };
  });
}
