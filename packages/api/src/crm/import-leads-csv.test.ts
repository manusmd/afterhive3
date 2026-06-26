import { beforeEach, describe, expect, it, vi } from "vitest";
import type { SessionContext } from "@afterhive/domain";
import { ImportLeadsCsvError, importLeadsCsv, validateLeadImportMapping } from "./import-leads-csv";

const tenantId = "tenant-1";
const tenantSlug = "demo-club";
const locationNorth = "loc-north";
const locationSouth = "loc-south";

const getDb = vi.hoisted(() => vi.fn());

vi.mock("@afterhive/db", () => ({
  getDb,
}));

vi.mock("../auth/tenant-locations", () => ({
  listTenantLocations: vi.fn(async () => [
    { id: locationNorth, name: "Standort Nord" },
    { id: locationSouth, name: "Standort Sued" },
  ]),
}));

const ownerSession: SessionContext = {
  userId: "owner-1",
  surface: "tenant_admin",
  tenantId,
  tenantSlug,
  roles: ["tenant_owner"],
  locationIds: undefined,
};

describe("validateLeadImportMapping", () => {
  it("requires first and last name columns", () => {
    expect(validateLeadImportMapping({ firstName: "first_name", lastName: "last_name" }).ok).toBe(
      true,
    );
    expect(validateLeadImportMapping({ firstName: "", lastName: "last_name" }).ok).toBe(false);
  });
});

describe("importLeadsCsv", () => {
  beforeEach(() => {
    getDb.mockReset();
  });

  it("throws invalid_csv for empty content", async () => {
    await expect(
      importLeadsCsv(ownerSession, tenantSlug, {
        csvContent: "first_name,last_name\n",
        mapping: { firstName: "first_name", lastName: "last_name" },
        defaultLocationId: locationNorth,
      }),
    ).rejects.toMatchObject({ code: "invalid_csv" });
  });

  it("imports valid rows and reports row errors", async () => {
    let insertCount = 0;

    getDb.mockReturnValue({
      insert: vi.fn(() => {
        insertCount += 1;
        if (insertCount === 1) {
          return {
            values: vi.fn(() => ({
              returning: vi.fn(async () => [{ id: "job-1" }]),
            })),
          };
        }

        return {
          values: vi.fn(async () => undefined),
        };
      }),
      update: vi.fn(() => ({
        set: vi.fn(() => ({
          where: vi.fn(async () => undefined),
        })),
      })),
    });

    const csvContent = [
      "first_name,last_name,location_code",
      "Anna,Nord,Standort Nord",
      ",Sued,Standort Sued",
      "Ben,Sued,Unknown",
    ].join("\n");

    const outcome = await importLeadsCsv(ownerSession, tenantSlug, {
      csvContent,
      mapping: {
        firstName: "first_name",
        lastName: "last_name",
        locationCode: "location_code",
      },
      fileName: "leads.csv",
    });

    expect(outcome.jobId).toBe("job-1");
    expect(outcome.result.imported).toBe(1);
    expect(outcome.result.failed).toBe(2);
    expect(outcome.result.errors).toEqual([
      { row: 3, message: "missing_required_fields" },
      { row: 4, message: "invalid_location" },
    ]);
  });
});
