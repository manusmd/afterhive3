import { beforeEach, describe, expect, it, vi } from "vitest";
import type { SessionContext } from "@afterhive/domain";
import { CreateLeadError, createLead } from "./create-lead";

const tenantId = "tenant-1";
const tenantSlug = "demo-club";
const locationNorth = "loc-north";
const locationSouth = "loc-south";

const getDb = vi.hoisted(() => vi.fn());

vi.mock("@afterhive/db", () => ({
  getDb,
}));

const officeSession: SessionContext = {
  userId: "staff-1",
  surface: "tenant_admin",
  tenantId,
  tenantSlug,
  roles: ["tenant_office"],
  locationIds: [locationNorth],
  roleAssignments: [{ role: "tenant_office", locationIds: [locationNorth] }],
};

function mockDbForCreateLead(locationFound: boolean) {
  getDb.mockReturnValue({
    select: () => ({
      from: () => ({
        innerJoin: () => ({
          where: () => ({
            limit: () => Promise.resolve(locationFound ? [{ id: locationNorth }] : []),
          }),
        }),
      }),
    }),
    insert: () => ({
      values: () => ({
        returning: () =>
          Promise.resolve([
            {
              id: "lead-new",
              firstName: "Anna",
              lastName: "Nord",
              status: "new",
              source: "manual",
              locationId: locationNorth,
            },
          ]),
      }),
    }),
  });
}

describe("createLead", () => {
  beforeEach(() => {
    getDb.mockReset();
  });

  it("creates a lead within scoped session locations", async () => {
    mockDbForCreateLead(true);

    await expect(
      createLead(officeSession, tenantSlug, {
        firstName: "Anna",
        lastName: "Nord",
        locationId: locationNorth,
      }),
    ).resolves.toEqual({
      leadId: "lead-new",
      firstName: "Anna",
      lastName: "Nord",
      status: "new",
      source: "manual",
      locationId: locationNorth,
    });
  });

  it("throws location_forbidden outside scoped locations", async () => {
    await expect(
      createLead(officeSession, tenantSlug, {
        firstName: "Anna",
        lastName: "Nord",
        locationId: locationSouth,
      }),
    ).rejects.toMatchObject({ code: "location_forbidden" });

    expect(getDb).not.toHaveBeenCalled();
  });

  it("throws invalid_location when location is not in tenant", async () => {
    mockDbForCreateLead(false);

    await expect(
      createLead(officeSession, tenantSlug, {
        firstName: "Anna",
        lastName: "Nord",
        locationId: locationNorth,
      }),
    ).rejects.toMatchObject({ code: "invalid_location" });
  });

  it("throws tenant_not_found without tenantId", async () => {
    await expect(
      createLead(
        {
          ...officeSession,
          tenantId: undefined,
        },
        tenantSlug,
        {
          firstName: "Anna",
          lastName: "Nord",
          locationId: locationNorth,
        },
      ),
    ).rejects.toMatchObject({ code: "tenant_not_found" });

    expect(getDb).not.toHaveBeenCalled();
  });
});
