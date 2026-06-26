import { describe, expect, it } from "vitest";
import { canExportPerson, resolveExportLocationIds } from "./can-export-person";

const locationNorth = "loc-north";
const locationSouth = "loc-south";

describe("canExportPerson", () => {
  it("allows owner and admin by default", () => {
    expect(canExportPerson(["tenant_owner"], undefined)).toBe(true);
    expect(canExportPerson(["tenant_admin"], [])).toBe(true);
  });

  it("requires assigned locations for scoped roles", () => {
    expect(canExportPerson(["tenant_office"], [])).toBe(false);
    expect(canExportPerson(["tenant_office"], [locationNorth])).toBe(true);
    expect(canExportPerson(["tenant_location_manager"], [locationNorth])).toBe(true);
  });

  it("denies finance and coach", () => {
    expect(canExportPerson(["tenant_finance"], undefined)).toBe(false);
    expect(canExportPerson(["tenant_coach"], [locationNorth])).toBe(false);
  });

  it("does not grant all-location export from finance mixed with scoped export roles", () => {
    const assignments = [
      { role: "tenant_finance", locationIds: null },
      { role: "tenant_office", locationIds: [locationNorth] },
    ];

    expect(canExportPerson(["tenant_finance", "tenant_office"], undefined, assignments)).toBe(
      true,
    );
    expect(
      resolveExportLocationIds(["tenant_finance", "tenant_office"], assignments),
    ).toEqual([locationNorth]);
    expect(
      resolveExportLocationIds(["tenant_finance", "tenant_office"], assignments),
    ).not.toContain(locationSouth);
  });

  it("denies finance plus office when office has no assigned locations", () => {
    const assignments = [
      { role: "tenant_finance", locationIds: null },
      { role: "tenant_office", locationIds: [] },
    ];

    expect(canExportPerson(["tenant_finance", "tenant_office"], undefined, assignments)).toBe(
      false,
    );
    expect(
      resolveExportLocationIds(["tenant_finance", "tenant_office"], assignments),
    ).toEqual([]);
  });

  it("returns all locations only when owner or admin has no location assignment", () => {
    expect(
      resolveExportLocationIds(
        ["tenant_admin"],
        [{ role: "tenant_admin", locationIds: [] }],
      ),
    ).toBeUndefined();
    expect(
      resolveExportLocationIds(
        ["tenant_owner"],
        [{ role: "tenant_owner", locationIds: null }],
      ),
    ).toBeUndefined();
  });
});
