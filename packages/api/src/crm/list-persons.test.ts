import { beforeEach, describe, expect, it, vi } from "vitest";
import type { SessionContext } from "@afterhive/domain";
import { isWithinLocationScope } from "../location/location-scope";
import { listPersons, resolveListPersonsLocationScope } from "./list-persons";

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
    id: "person-north",
    firstName: "Anna",
    lastName: "Nord",
    createdAt: new Date("2026-06-26T12:00:00.000Z"),
    locationId: locationNorth,
  },
  {
    id: "person-south",
    firstName: "Ben",
    lastName: "Sued",
    createdAt: new Date("2026-06-26T11:00:00.000Z"),
    locationId: locationSouth,
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
        where: () => ({
          orderBy: () =>
            Promise.resolve(
              session.locationIds === undefined
                ? fixtureRows.map(({ locationId: _locationId, ...row }) => row)
                : [],
            ),
        }),
      }),
    }),
    selectDistinct: () => ({
      from: () => ({
        innerJoin: () => ({
          where: () => ({
            orderBy: () =>
              Promise.resolve(
                filterFixtureRows(session).map(({ locationId: _locationId, ...row }) => row),
              ),
          }),
        }),
      }),
    }),
  });
}

describe("resolveListPersonsLocationScope", () => {
  it("passes through undefined for all-location sessions", () => {
    expect(resolveListPersonsLocationScope(undefined)).toBeUndefined();
  });

  it("passes through assigned location ids for scoped staff", () => {
    expect(resolveListPersonsLocationScope([locationNorth])).toEqual([locationNorth]);
  });
});

describe("listPersons", () => {
  beforeEach(() => {
    buildLocationScopeFilter.mockReset();
    getDb.mockReset();
    buildLocationScopeFilter.mockImplementation((_, locationIds) =>
      locationIds === undefined ? undefined : { type: "scope-filter" },
    );
  });

  it("returns an empty list without tenantId", async () => {
    await expect(
      listPersons({
        userId: "staff-1",
        surface: "tenant_admin",
        roles: ["tenant_office"],
      }),
    ).resolves.toEqual([]);
    expect(getDb).not.toHaveBeenCalled();
  });

  it("returns no persons when scoped office staff have no assigned locations", async () => {
    const items = await listPersons(unassignedOfficeSession);

    expect(items).toEqual([]);
    expect(getDb).not.toHaveBeenCalled();
  });

  it("scopes persons through converted leads for single-location office staff", async () => {
    mockDbForSession(officeSession);

    const items = await listPersons(officeSession);

    expect(buildLocationScopeFilter).toHaveBeenCalledWith(expect.anything(), [locationNorth]);
    expect(items).toHaveLength(1);
    expect(items[0]?.id).toBe("person-north");
  });

  it("returns all tenant persons for all-location roles", async () => {
    mockDbForSession(ownerSession);

    const items = await listPersons(ownerSession);

    expect(buildLocationScopeFilter).not.toHaveBeenCalled();
    expect(items).toHaveLength(2);
    expect(items.map((item) => item.id)).toEqual(["person-north", "person-south"]);
  });
});
