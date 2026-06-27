import { and, eq, inArray, notInArray } from "drizzle-orm";
import { getDb } from "@afterhive/db";
import {
  departments,
  memberProfiles,
  rosterEntries,
  teams,
  tenants,
} from "@afterhive/db/schema";
import type { SessionContext } from "@afterhive/domain";
import { isWithinLocationScope } from "../location/location-scope";
import { tenantHasClubSportModule } from "../tenant/has-club-sport-module";
import { canUpdateRoster, resolveUpdateRosterLocationIds } from "./can-update-roster";

export type UpdateRosterEntryInput = {
  memberProfileId: string;
  jerseyNumber?: string | null;
};

export type UpdateRosterInput = {
  teamId: string;
  entries: UpdateRosterEntryInput[];
};

export class UpdateRosterError extends Error {
  constructor(
    readonly code:
      | "tenant_not_found"
      | "forbidden"
      | "missing_fields"
      | "team_not_found"
      | "location_forbidden"
      | "duplicate_member"
      | "member_not_found",
  ) {
    super(code);
    this.name = "UpdateRosterError";
  }
}

function todayIsoDate() {
  return new Date().toISOString().slice(0, 10);
}

export function validateUpdateRosterInput(input: UpdateRosterInput) {
  if (typeof input.teamId !== "string" || !Array.isArray(input.entries)) {
    return "missing_fields" as const;
  }

  if (!input.teamId.trim()) {
    return "missing_fields" as const;
  }

  for (const entry of input.entries) {
    if (typeof entry.memberProfileId !== "string" || !entry.memberProfileId.trim()) {
      return "missing_fields" as const;
    }
  }

  const memberIds = input.entries.map((entry) => entry.memberProfileId);
  if (new Set(memberIds).size !== memberIds.length) {
    return "duplicate_member" as const;
  }

  return null;
}

export async function updateRoster(
  session: SessionContext,
  tenantSlug: string,
  input: UpdateRosterInput,
): Promise<void> {
  if (!session.tenantId) {
    throw new UpdateRosterError("tenant_not_found");
  }

  if (!canUpdateRoster(session.roles, session.locationIds, session.roleAssignments)) {
    throw new UpdateRosterError("forbidden");
  }

  if (!(await tenantHasClubSportModule(session.tenantId))) {
    throw new UpdateRosterError("forbidden");
  }

  const validationError = validateUpdateRosterInput(input);
  if (validationError) {
    throw new UpdateRosterError(validationError);
  }

  const writeLocationIds = session.roleAssignments
    ? resolveUpdateRosterLocationIds(session.roles, session.roleAssignments)
    : session.locationIds;

  const db = getDb();
  const memberProfileIds = input.entries.map((entry) => entry.memberProfileId);
  const fromDate = todayIsoDate();

  await db.transaction(async (tx) => {
    const [teamRow] = await tx
      .select({
        teamId: teams.id,
        locationId: departments.locationId,
      })
      .from(teams)
      .innerJoin(departments, eq(teams.departmentId, departments.id))
      .innerJoin(tenants, eq(teams.tenantId, tenants.id))
      .where(
        and(
          eq(teams.id, input.teamId),
          eq(tenants.slug, tenantSlug),
          eq(teams.tenantId, session.tenantId!),
        ),
      )
      .limit(1);

    if (!teamRow) {
      throw new UpdateRosterError("team_not_found");
    }

    if (!isWithinLocationScope(teamRow.locationId, writeLocationIds)) {
      throw new UpdateRosterError("location_forbidden");
    }

    if (memberProfileIds.length > 0) {
      const members = await tx
        .select({ id: memberProfiles.id })
        .from(memberProfiles)
        .where(
          and(
            eq(memberProfiles.tenantId, session.tenantId!),
            inArray(memberProfiles.id, memberProfileIds),
          ),
        );

      if (members.length !== memberProfileIds.length) {
        throw new UpdateRosterError("member_not_found");
      }
    }

    if (memberProfileIds.length === 0) {
      await tx
        .update(rosterEntries)
        .set({ status: "inactive", toDate: fromDate, updatedAt: new Date() })
        .where(
          and(
            eq(rosterEntries.teamId, input.teamId),
            eq(rosterEntries.tenantId, session.tenantId!),
            eq(rosterEntries.status, "active"),
          ),
        );
      return;
    }

    await tx
      .update(rosterEntries)
      .set({ status: "inactive", toDate: fromDate, updatedAt: new Date() })
      .where(
        and(
          eq(rosterEntries.teamId, input.teamId),
          eq(rosterEntries.tenantId, session.tenantId!),
          eq(rosterEntries.status, "active"),
          notInArray(rosterEntries.memberProfileId, memberProfileIds),
        ),
      );

    for (const entry of input.entries) {
      const jerseyNumber =
        typeof entry.jerseyNumber === "string" && entry.jerseyNumber.trim()
          ? entry.jerseyNumber.trim()
          : null;

      const [existing] = await tx
        .select({ id: rosterEntries.id, status: rosterEntries.status })
        .from(rosterEntries)
        .where(
          and(
            eq(rosterEntries.teamId, input.teamId),
            eq(rosterEntries.tenantId, session.tenantId!),
            eq(rosterEntries.memberProfileId, entry.memberProfileId),
          ),
        )
        .limit(1);

      if (existing) {
        await tx
          .update(rosterEntries)
          .set({
            status: "active",
            jerseyNumber,
            fromDate,
            toDate: null,
            updatedAt: new Date(),
          })
          .where(eq(rosterEntries.id, existing.id));
        continue;
      }

      await tx.insert(rosterEntries).values({
        tenantId: session.tenantId!,
        teamId: input.teamId,
        memberProfileId: entry.memberProfileId,
        jerseyNumber,
        status: "active",
        fromDate,
      });
    }
  });
}
