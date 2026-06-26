import { and, eq } from "drizzle-orm";
import { getDb } from "@afterhive/db";
import { leads, tenants } from "@afterhive/db/schema";
import type { SessionContext } from "@afterhive/domain";
import { isWithinLocationScope } from "../location/location-scope";
import { resolveLeadUpdateLocationIds } from "./can-update-lead";
import {
  canReopenLostLead,
  canTransitionLeadStatus,
  requiresAdminReopen,
  requiresLostReason,
} from "./lead-status";

export type UpdateLeadStatusInput = {
  status: string;
  lostReason?: string;
};

export type UpdateLeadStatusResult = {
  leadId: string;
  status: string;
  lostReason: string | null;
  lastActivityAt: string;
};

export class UpdateLeadStatusError extends Error {
  constructor(
    readonly code:
      | "tenant_not_found"
      | "lead_not_found"
      | "location_forbidden"
      | "invalid_status"
      | "invalid_transition"
      | "missing_lost_reason"
      | "reopen_forbidden",
  ) {
    super(code);
    this.name = "UpdateLeadStatusError";
  }
}

const MAX_LOST_REASON_LENGTH = 500;

export function validateUpdateLeadStatusInput(input: UpdateLeadStatusInput) {
  if (typeof input.status !== "string" || !input.status.trim()) {
    return { ok: false as const, code: "invalid_status" as const };
  }

  const status = input.status.trim();
  const lostReason =
    typeof input.lostReason === "string" ? input.lostReason.trim() : undefined;

  if (requiresLostReason(status) && !lostReason) {
    return { ok: false as const, code: "missing_lost_reason" as const };
  }

  if (lostReason && lostReason.length > MAX_LOST_REASON_LENGTH) {
    return { ok: false as const, code: "invalid_status" as const };
  }

  return {
    ok: true as const,
    status,
    lostReason: lostReason ?? null,
  };
}

export async function updateLeadStatus(
  session: SessionContext,
  tenantSlug: string,
  leadId: string,
  input: UpdateLeadStatusInput,
): Promise<UpdateLeadStatusResult> {
  if (!session.tenantId) {
    throw new UpdateLeadStatusError("tenant_not_found");
  }

  const validation = validateUpdateLeadStatusInput(input);
  if (!validation.ok) {
    throw new UpdateLeadStatusError(validation.code);
  }

  const updateLocationIds = session.roleAssignments
    ? resolveLeadUpdateLocationIds(session.roles, session.roleAssignments)
    : session.locationIds;

  const db = getDb();
  const lastActivityAt = new Date();

  return db.transaction(async (tx) => {
    const [lead] = await tx
      .select({
        id: leads.id,
        locationId: leads.locationId,
        status: leads.status,
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
      throw new UpdateLeadStatusError("lead_not_found");
    }

    if (!isWithinLocationScope(lead.locationId, updateLocationIds)) {
      throw new UpdateLeadStatusError("location_forbidden");
    }

    if (requiresAdminReopen(lead.status, validation.status) && !canReopenLostLead(session.roles)) {
      throw new UpdateLeadStatusError("reopen_forbidden");
    }

    if (!canTransitionLeadStatus(lead.status, validation.status)) {
      throw new UpdateLeadStatusError("invalid_transition");
    }

    const [updatedLead] = await tx
      .update(leads)
      .set({
        status: validation.status,
        lostReason: validation.status === "lost" ? validation.lostReason : null,
        lastActivityAt,
      })
      .where(and(eq(leads.id, lead.id), eq(leads.status, lead.status)))
      .returning({
        id: leads.id,
        status: leads.status,
        lostReason: leads.lostReason,
        lastActivityAt: leads.lastActivityAt,
      });

    if (!updatedLead) {
      throw new UpdateLeadStatusError("invalid_transition");
    }

    return {
      leadId: updatedLead.id,
      status: updatedLead.status,
      lostReason: updatedLead.lostReason,
      lastActivityAt: updatedLead.lastActivityAt.toISOString(),
    };
  });
}
