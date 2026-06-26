import { and, eq, isNull } from "drizzle-orm";
import { getDb } from "@afterhive/db";
import { leads, persons, tenants } from "@afterhive/db/schema";
import type { SessionContext } from "@afterhive/domain";
import { isWithinLocationScope } from "../location/location-scope";
import {
  isLeadConvertibleStatus,
  resolveLeadConvertLocationIds,
} from "./can-convert-lead";

export type ConvertLeadResult = {
  leadId: string;
  personId: string;
  status: string;
  convertedAt: string;
};

export class ConvertLeadError extends Error {
  constructor(
    readonly code:
      | "tenant_not_found"
      | "lead_not_found"
      | "location_forbidden"
      | "invalid_status"
      | "already_converted",
  ) {
    super(code);
    this.name = "ConvertLeadError";
  }
}

export async function convertLead(
  session: SessionContext,
  tenantSlug: string,
  leadId: string,
): Promise<ConvertLeadResult> {
  if (!session.tenantId) {
    throw new ConvertLeadError("tenant_not_found");
  }

  const convertLocationIds = session.roleAssignments
    ? resolveLeadConvertLocationIds(session.roles, session.roleAssignments)
    : session.locationIds;

  const db = getDb();
  const convertedAt = new Date();

  return db.transaction(async (tx) => {
    const [lead] = await tx
      .select({
        id: leads.id,
        locationId: leads.locationId,
        firstName: leads.firstName,
        lastName: leads.lastName,
        status: leads.status,
        convertedPersonId: leads.convertedPersonId,
      })
      .from(leads)
      .innerJoin(tenants, eq(leads.tenantId, tenants.id))
      .where(
        and(
          eq(leads.id, leadId),
          eq(tenants.slug, tenantSlug),
          eq(leads.tenantId, session.tenantId!),
        ),
      )
      .for("update")
      .limit(1);

    if (!lead) {
      throw new ConvertLeadError("lead_not_found");
    }

    if (lead.convertedPersonId || lead.status === "converted") {
      throw new ConvertLeadError("already_converted");
    }

    if (!isLeadConvertibleStatus(lead.status)) {
      throw new ConvertLeadError("invalid_status");
    }

    if (!isWithinLocationScope(lead.locationId, convertLocationIds)) {
      throw new ConvertLeadError("location_forbidden");
    }

    const [person] = await tx
      .insert(persons)
      .values({
        tenantId: session.tenantId!,
        firstName: lead.firstName,
        lastName: lead.lastName,
      })
      .returning({ id: persons.id });

    const [updatedLead] = await tx
      .update(leads)
      .set({
        status: "converted",
        convertedPersonId: person.id,
        convertedAt,
      })
      .where(
        and(
          eq(leads.id, lead.id),
          eq(leads.status, "qualified"),
          isNull(leads.convertedPersonId),
        ),
      )
      .returning({
        id: leads.id,
        status: leads.status,
        convertedAt: leads.convertedAt,
      });

    if (!updatedLead) {
      throw new ConvertLeadError("already_converted");
    }

    return {
      leadId: updatedLead.id,
      personId: person.id,
      status: updatedLead.status,
      convertedAt: updatedLead.convertedAt!.toISOString(),
    };
  });
}
