import { beforeEach, describe, expect, it, vi } from "vitest";
import type { SessionContext } from "@afterhive/domain";
import { isWithinLocationScope } from "../location/location-scope";
import { listLeads, resolveListLeadsLocationScope } from "./list-leads";

const tenantId = "tenant-1";
const locationNorth = "loc-north";
const locationSouth = "loc-south";

const ownerSession: SessionContext = {
  userId: "owner-1",
  surface: "tenant_admin",
  tenantId,
  tenantSlug: "demo-club",
  roles: ["tenant_owner"],
};

const officeSession: SessionContext = {
  userId: "staff-1",
  surface: "tenant_admin",
  tenantId,
  tenantSlug: "demo-club",
  roles: ["tenant_office"],
  locationIds: [locationNorth],
};

const fixtureRows = [
  {
    id: "lead-north",
    firstName: "Anna",
    lastName: "Nord",
    status: "new",
    source: "manual",
    locationId: locationNorth,
    locationName: "Standort Nord",
    lastActivityAt: new Date("2026-06-26T12:00:00.000Z"),
  },
  {
    id: "lead-south",
    firstName: "Ben",
    lastName: "Sued",
    status: "new",
    source: "manual",
    locationId: locationSouth,
    locationName: "Standort Sued",
    lastActivityAt: new Date("2026-06-26T11:00:00.000Z"),
  },
];

const buildLocationScopeFilter = vi.hoisted(() => vi.fn());
const getDb = vi.hoisted(() => vi.fn());

vi.mock("../location/location-scope", async (importOriginal) => {
  const actual = await importOriginal<typeof import("../location/location-scope")>();
  return {
    ...actual,
    buildLocationScopeFilter,
  };
});

vi.mock("@afterhive/db", () => ({
  getDb,
}));

function filterFixtureRows(session: SessionContext) {
  return fixtureRows.filter((row) =>
    isWithinLocationScope(row.locationId, session.locationIds),
  );
}

function mockDbForSession(session: SessionContext) {
  getDb.mockReturnValue({
    select: () => ({
      from: () => ({
        innerJoin: () => ({
          where: () => ({
            orderBy: () => Promise.resolve(filterFixtureRows(session)),
          }),
        }),
      }),
    }),
  });
}

describe("resolveListLeadsLocationScope", () => {
  it("returns undefined for all-location roles", () => {
    expect(resolveListLeadsLocationScope(undefined)).toBeUndefined();
    expect(resolveListLeadsLocationScope([])).toBeUndefined();
  });

  it("returns assigned location ids for scoped office staff", () => {
    expect(resolveListLeadsLocationScope([locationNorth])).toEqual([locationNorth]);
  });
});

describe("listLeads", () => {
  beforeEach(() => {
    buildLocationScopeFilter.mockReset();
    getDb.mockReset();
    buildLocationScopeFilter.mockImplementation((_, locationIds) =>
      locationIds ? { type: "scope-filter" } : undefined,
    );
  });

  it("returns an empty list without tenantId", async () => {
    await expect(
      listLeads({
        userId: "staff-1",
        surface: "tenant_admin",
        roles: ["tenant_office"],
      }),
    ).resolves.toEqual([]);
    expect(getDb).not.toHaveBeenCalled();
  });

  it("applies a location scope filter for single-location office staff", async () => {
    mockDbForSession(officeSession);

    const items = await listLeads(officeSession);

    expect(buildLocationScopeFilter).toHaveBeenCalledWith(expect.anything(), [locationNorth]);
    expect(items).toHaveLength(1);
    expect(items[0]?.id).toBe("lead-north");
    expect(items[0]?.locationName).toBe("Standort Nord");
  });

  it("returns all tenant leads for all-location roles", async () => {
    mockDbForSession(ownerSession);

    const items = await listLeads(ownerSession);

    expect(buildLocationScopeFilter).toHaveBeenCalledWith(expect.anything(), undefined);
    expect(items).toHaveLength(2);
    expect(items.map((item) => item.id)).toEqual(["lead-north", "lead-south"]);
  });
});
