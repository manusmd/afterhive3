import { beforeEach, describe, expect, it, vi } from "vitest";
import type { SessionContext } from "@afterhive/domain";
import { ConvertLeadError, convertLead } from "./convert-lead";

const tenantId = "tenant-1";
const tenantSlug = "demo-club";
const locationNorth = "loc-north";
const locationSouth = "loc-south";
const leadId = "lead-1";

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

type MockLead = {
  id: string;
  tenantId: string;
  locationId: string;
  firstName: string;
  lastName: string;
  status: string;
  convertedPersonId: string | null;
};

function mockTransaction(options: {
  lead: MockLead | null;
  updatedLead?: MockLead | null;
}) {
  const transaction = vi.fn(async (callback: (tx: unknown) => Promise<unknown>) => {
    const tx = {
      select: () => ({
        from: () => ({
          innerJoin: () => ({
            where: () => ({
              for: () => ({
                limit: () => Promise.resolve(options.lead ? [options.lead] : []),
              }),
            }),
          }),
        }),
      }),
      insert: () => ({
        values: () => ({
          returning: () => Promise.resolve([{ id: "person-1" }]),
        }),
      }),
      update: () => ({
        set: () => ({
          where: () => ({
            returning: () =>
              Promise.resolve(
                options.updatedLead === undefined
                  ? [
                      {
                        id: leadId,
                        status: "converted",
                        convertedAt: new Date("2026-06-26T12:00:00.000Z"),
                      },
                    ]
                  : options.updatedLead
                    ? [
                        {
                          id: options.updatedLead.id,
                          status: "converted",
                          convertedAt: new Date("2026-06-26T12:00:00.000Z"),
                        },
                      ]
                    : [],
              ),
          }),
        }),
      }),
    };

    return callback(tx);
  });

  getDb.mockReturnValue({ transaction });
  return transaction;
}

describe("convertLead", () => {
  beforeEach(() => {
    getDb.mockReset();
  });

  it("throws tenant_not_found without tenantId", async () => {
    await expect(
      convertLead(
        {
          ...officeSession,
          tenantId: undefined,
        },
        tenantSlug,
        leadId,
      ),
    ).rejects.toMatchObject({ code: "tenant_not_found" });

    expect(getDb).not.toHaveBeenCalled();
  });

  it("throws lead_not_found when lead is missing", async () => {
    mockTransaction({ lead: null });

    await expect(convertLead(officeSession, tenantSlug, leadId)).rejects.toMatchObject({
      code: "lead_not_found",
    });
  });

  it("throws invalid_status when lead is not qualified", async () => {
    mockTransaction({
      lead: {
        id: leadId,
        tenantId,
        locationId: locationNorth,
        firstName: "Anna",
        lastName: "Nord",
        status: "new",
        convertedPersonId: null,
      },
    });

    await expect(convertLead(officeSession, tenantSlug, leadId)).rejects.toMatchObject({
      code: "invalid_status",
    });
  });

  it("throws already_converted when lead was converted", async () => {
    mockTransaction({
      lead: {
        id: leadId,
        tenantId,
        locationId: locationNorth,
        firstName: "Anna",
        lastName: "Nord",
        status: "converted",
        convertedPersonId: "person-existing",
      },
    });

    await expect(convertLead(officeSession, tenantSlug, leadId)).rejects.toMatchObject({
      code: "already_converted",
    });
  });

  it("throws location_forbidden outside scoped locations", async () => {
    const transaction = mockTransaction({
      lead: {
        id: leadId,
        tenantId,
        locationId: locationSouth,
        firstName: "Ben",
        lastName: "Sued",
        status: "qualified",
        convertedPersonId: null,
      },
    });

    await expect(convertLead(officeSession, tenantSlug, leadId)).rejects.toMatchObject({
      code: "location_forbidden",
    });

    expect(transaction).toHaveBeenCalledOnce();
  });

  it("throws already_converted when the guarded update matches no row", async () => {
    mockTransaction({
      lead: {
        id: leadId,
        tenantId,
        locationId: locationNorth,
        firstName: "Anna",
        lastName: "Nord",
        status: "qualified",
        convertedPersonId: null,
      },
      updatedLead: null,
    });

    await expect(convertLead(officeSession, tenantSlug, leadId)).rejects.toMatchObject({
      code: "already_converted",
    });
  });

  it("creates a person and marks the lead converted in a transaction", async () => {
    const transaction = mockTransaction({
      lead: {
        id: leadId,
        tenantId,
        locationId: locationNorth,
        firstName: "Anna",
        lastName: "Nord",
        status: "qualified",
        convertedPersonId: null,
      },
    });

    await expect(convertLead(officeSession, tenantSlug, leadId)).resolves.toEqual({
      leadId,
      personId: "person-1",
      status: "converted",
      convertedAt: "2026-06-26T12:00:00.000Z",
    });

    expect(transaction).toHaveBeenCalledOnce();
  });
});
