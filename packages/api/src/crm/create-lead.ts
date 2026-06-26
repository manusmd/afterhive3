import { and, eq } from "drizzle-orm";
import { getDb } from "@afterhive/db";
import { leads, locations, tenants } from "@afterhive/db/schema";
import type { SessionContext } from "@afterhive/domain";
import { isWithinLocationScope } from "../location/location-scope";
import { listTenantLocations } from "../auth/tenant-locations";
import { resolveLeadCreateLocationIds } from "./can-create-lead";

export type CreateLeadInput = {
  firstName: string;
  lastName: string;
  locationId: string;
};

export type CreateLeadResult = {
  leadId: string;
  firstName: string;
  lastName: string;
  status: string;
  source: string;
  locationId: string;
};

export class CreateLeadError extends Error {
  constructor(
    readonly code:
      | "tenant_not_found"
      | "missing_fields"
      | "invalid_location"
      | "location_forbidden"
      | "too_long",
  ) {
    super(code);
    this.name = "CreateLeadError";
  }
}

const MAX_NAME_LENGTH = 255;
const DEFAULT_SOURCE = "manual";
const DEFAULT_STATUS = "new";

export function normalizeLeadName(value: string) {
  return value.trim();
}

export function validateCreateLeadInput(input: CreateLeadInput) {
  if (
    typeof input.firstName !== "string" ||
    typeof input.lastName !== "string" ||
    typeof input.locationId !== "string"
  ) {
    return { ok: false as const, code: "missing_fields" as const };
  }

  const firstName = normalizeLeadName(input.firstName);
  const lastName = normalizeLeadName(input.lastName);

  if (!firstName || !lastName || !input.locationId) {
    return { ok: false as const, code: "missing_fields" as const };
  }

  if (firstName.length > MAX_NAME_LENGTH || lastName.length > MAX_NAME_LENGTH) {
    return { ok: false as const, code: "too_long" as const };
  }

  return {
    ok: true as const,
    firstName,
    lastName,
    locationId: input.locationId,
    source: DEFAULT_SOURCE,
  };
}

export async function listLeadFormLocations(session: SessionContext, tenantSlug: string) {
  const locations = await listTenantLocations(tenantSlug);
  const createLocationIds = session.roleAssignments
    ? resolveLeadCreateLocationIds(session.roles, session.roleAssignments)
    : session.locationIds;

  if (createLocationIds === undefined) {
    return locations;
  }

  if (createLocationIds.length === 0) {
    return [];
  }

  return locations.filter((location) => createLocationIds.includes(location.id));
}

export async function createLead(
  session: SessionContext,
  tenantSlug: string,
  input: CreateLeadInput,
): Promise<CreateLeadResult> {
  if (!session.tenantId) {
    throw new CreateLeadError("tenant_not_found");
  }

  const validation = validateCreateLeadInput(input);
  if (!validation.ok) {
    throw new CreateLeadError(validation.code);
  }

  const createLocationIds = session.roleAssignments
    ? resolveLeadCreateLocationIds(session.roles, session.roleAssignments)
    : session.locationIds;

  if (!isWithinLocationScope(validation.locationId, createLocationIds)) {
    throw new CreateLeadError("location_forbidden");
  }

  const db = getDb();

  const [location] = await db
    .select({ id: locations.id })
    .from(locations)
    .innerJoin(tenants, eq(locations.tenantId, tenants.id))
    .where(
      and(
        eq(tenants.slug, tenantSlug),
        eq(locations.id, validation.locationId),
        eq(locations.tenantId, session.tenantId),
      ),
    )
    .limit(1);

  if (!location) {
    throw new CreateLeadError("invalid_location");
  }

  const [lead] = await db
    .insert(leads)
    .values({
      tenantId: session.tenantId,
      locationId: validation.locationId,
      firstName: validation.firstName,
      lastName: validation.lastName,
      status: DEFAULT_STATUS,
      source: validation.source,
    })
    .returning({
      id: leads.id,
      firstName: leads.firstName,
      lastName: leads.lastName,
      status: leads.status,
      source: leads.source,
      locationId: leads.locationId,
    });

  return {
    leadId: lead.id,
    firstName: lead.firstName,
    lastName: lead.lastName,
    status: lead.status,
    source: lead.source,
    locationId: lead.locationId,
  };
}
