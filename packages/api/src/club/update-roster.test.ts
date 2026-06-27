import { beforeEach, describe, expect, it, vi } from "vitest";
import type { SessionContext } from "@afterhive/domain";
import { UpdateRosterError, updateRoster, validateUpdateRosterInput } from "./update-roster";

const getDb = vi.hoisted(() => vi.fn());
const tenantHasClubSportModule = vi.hoisted(() => vi.fn(() => Promise.resolve(true)));

vi.mock("@afterhive/db", () => ({
  getDb,
}));

vi.mock("../tenant/has-club-sport-module", () => ({
  tenantHasClubSportModule,
}));

const tenantId = "tenant-1";
const tenantSlug = "demo-club";
const teamId = "team-1";
const locationId = "loc-1";
const memberProfileId = "member-1";

const ownerSession: SessionContext = {
  userId: "owner-1",
  surface: "tenant_admin",
  tenantId,
  tenantSlug,
  roles: ["tenant_owner"],
};

const selectResults = vi.hoisted(() => ({
  team: { teamId: "team-1", locationId: "loc-1" } as {
    teamId: string;
    locationId: string;
  } | null,
  members: [{ id: "member-1" }] as { id: string }[],
  existing: null as { id: string; status: "active" | "inactive" } | null,
}));

const update = vi.hoisted(() => vi.fn(() => Promise.resolve()));
const updateSetPayloads = vi.hoisted(() => [] as Record<string, unknown>[]);
const insert = vi.hoisted(() => vi.fn(() => Promise.resolve()));

function mockTransaction() {
  let memberSelectCall = 0;

  return {
    select: () => ({
      from: () => ({
        innerJoin: () => ({
          innerJoin: () => ({
            where: () => ({
              limit: () => Promise.resolve(selectResults.team ? [selectResults.team] : []),
            }),
          }),
        }),
        where: () => {
          memberSelectCall += 1;

          if (memberSelectCall === 1) {
            return Promise.resolve(selectResults.members);
          }

          return {
            limit: () => Promise.resolve(selectResults.existing ? [selectResults.existing] : []),
          };
        },
      }),
    }),
    update: () => ({
      set: (payload: Record<string, unknown>) => {
        updateSetPayloads.push(payload);
        return {
          where: update,
        };
      },
    }),
    insert: () => ({
      values: insert,
    }),
  };
}

describe("validateUpdateRosterInput", () => {
  it("rejects duplicate members", () => {
    expect(
      validateUpdateRosterInput({
        teamId,
        entries: [
          { memberProfileId: "a" },
          { memberProfileId: "a" },
        ],
      }),
    ).toBe("duplicate_member");
  });

  it("accepts valid input", () => {
    expect(
      validateUpdateRosterInput({
        teamId,
        entries: [{ memberProfileId }],
      }),
    ).toBeNull();
  });
});

describe("updateRoster", () => {
  beforeEach(() => {
    selectResults.team = { teamId, locationId };
    selectResults.members = [{ id: memberProfileId }];
    selectResults.existing = null;
    update.mockClear();
    updateSetPayloads.length = 0;
    insert.mockClear();
    tenantHasClubSportModule.mockResolvedValue(true);
    getDb.mockReturnValue({
      transaction: (fn: (tx: ReturnType<typeof mockTransaction>) => Promise<void>) =>
        fn(mockTransaction()),
    });
  });

  it("inserts a new active roster entry", async () => {
    await updateRoster(ownerSession, tenantSlug, {
      teamId,
      entries: [{ memberProfileId, jerseyNumber: "10" }],
    });

    expect(insert).toHaveBeenCalledTimes(1);
  });

  it("reactivates an existing roster entry", async () => {
    selectResults.existing = { id: "entry-1", status: "inactive" };

    await updateRoster(ownerSession, tenantSlug, {
      teamId,
      entries: [{ memberProfileId }],
    });

    expect(update).toHaveBeenCalled();
    const reactivateUpdate = updateSetPayloads.find((payload) => payload.status === "active");
    expect(reactivateUpdate).toMatchObject({
      status: "active",
      fromDate: expect.any(String),
      toDate: null,
    });
    expect(insert).not.toHaveBeenCalled();
  });

  it("preserves fromDate when updating an already-active roster entry", async () => {
    selectResults.existing = { id: "entry-1", status: "active" };

    await updateRoster(ownerSession, tenantSlug, {
      teamId,
      entries: [{ memberProfileId, jerseyNumber: "7" }],
    });

    const activeEntryUpdate = updateSetPayloads.find((payload) => payload.jerseyNumber === "7");
    expect(activeEntryUpdate).toMatchObject({ jerseyNumber: "7" });
    expect(activeEntryUpdate).not.toHaveProperty("fromDate");
    expect(activeEntryUpdate).not.toHaveProperty("status");
  });

  it("throws when club_sport module is disabled", async () => {
    tenantHasClubSportModule.mockResolvedValueOnce(false);

    await expect(
      updateRoster(ownerSession, tenantSlug, {
        teamId,
        entries: [{ memberProfileId }],
      }),
    ).rejects.toMatchObject({ code: "forbidden" });
  });

  it("throws when team is missing", async () => {
    selectResults.team = null;

    await expect(
      updateRoster(ownerSession, tenantSlug, {
        teamId,
        entries: [{ memberProfileId }],
      }),
    ).rejects.toMatchObject({ code: "team_not_found" satisfies UpdateRosterError["code"] });
  });

  it("throws when member is missing", async () => {
    selectResults.members = [];

    await expect(
      updateRoster(ownerSession, tenantSlug, {
        teamId,
        entries: [{ memberProfileId }],
      }),
    ).rejects.toMatchObject({ code: "member_not_found" });
  });
});
