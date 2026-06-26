import { beforeEach, describe, expect, it, vi } from "vitest";
import type { SessionContext } from "@afterhive/domain";
import { isWithinLocationScope } from "../location/location-scope";
import { listOffers } from "./list-offers";

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

const unassignedOfficeSession: SessionContext = {
  ...officeSession,
  locationIds: [],
};

const fixtureRows = [
  {
    offerId: "offer-north",
    name: "Course North",
    type: "course",
    status: "draft",
    locationId: locationNorth,
    createdAt: new Date("2026-06-26T12:00:00.000Z"),
  },
  {
    offerId: "offer-south",
    name: "Course South",
    type: "course",
    status: "draft",
    locationId: locationSouth,
    createdAt: new Date("2026-06-26T11:00:00.000Z"),
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
          where: () => Promise.resolve(filterFixtureRows(session)),
        }),
      }),
    }),
  });
}

describe("listOffers", () => {
  beforeEach(() => {
    buildLocationScopeFilter.mockReset();
    getDb.mockReset();
    buildLocationScopeFilter.mockImplementation((_, locationIds) =>
      locationIds === undefined ? undefined : { type: "scope-filter" },
    );
  });

  it("returns an empty list without tenantId", async () => {
    await expect(
      listOffers(
        {
          userId: "staff-1",
          surface: "tenant_admin",
          roles: ["tenant_office"],
        },
        "demo-club",
      ),
    ).resolves.toEqual([]);
    expect(getDb).not.toHaveBeenCalled();
  });

  it("returns no offers when scoped office staff have no assigned locations", async () => {
    const items = await listOffers(unassignedOfficeSession, "demo-club");

    expect(items).toEqual([]);
    expect(getDb).not.toHaveBeenCalled();
  });

  it("applies a location scope filter for single-location office staff", async () => {
    mockDbForSession(officeSession);

    const items = await listOffers(officeSession, "demo-club");

    expect(buildLocationScopeFilter).toHaveBeenCalledWith(expect.anything(), [locationNorth]);
    expect(items).toHaveLength(1);
    expect(items[0]?.offerId).toBe("offer-north");
  });

  it("returns all tenant offers for all-location roles", async () => {
    mockDbForSession(ownerSession);

    const items = await listOffers(ownerSession, "demo-club");

    expect(buildLocationScopeFilter).toHaveBeenCalledWith(expect.anything(), undefined);
    expect(items).toHaveLength(2);
    expect(items.map((item) => item.offerId)).toEqual(["offer-north", "offer-south"]);
  });
});
