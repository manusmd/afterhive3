import { describe, expect, it } from "vitest";
import { canRunImport, resolveImportLocationIds } from "./can-run-import";

const locationNorth = "loc-north";
const locationSouth = "loc-south";

describe("canRunImport", () => {
  it("allows owner, admin, office, and location manager with scope", () => {
    expect(canRunImport(["tenant_owner"], undefined)).toBe(true);
    expect(canRunImport(["tenant_admin"], [])).toBe(true);
    expect(canRunImport(["tenant_office"], [locationNorth])).toBe(true);
    expect(canRunImport(["tenant_location_manager"], [locationNorth])).toBe(true);
  });

  it("denies finance, coach, and scoped roles without locations", () => {
    expect(canRunImport(["tenant_finance"], undefined)).toBe(false);
    expect(canRunImport(["tenant_coach"], [locationNorth])).toBe(false);
    expect(canRunImport(["tenant_office"], [])).toBe(false);
    expect(canRunImport(["tenant_office"], undefined)).toBe(false);
  });

  it("does not grant import from finance mixed with scoped runner roles", () => {
    const assignments = [
      { role: "tenant_finance", locationIds: null },
      { role: "tenant_office", locationIds: [locationNorth] },
    ];

    expect(canRunImport(["tenant_finance", "tenant_office"], undefined, assignments)).toBe(true);
    expect(resolveImportLocationIds(["tenant_finance", "tenant_office"], assignments)).toEqual([
      locationNorth,
    ]);
  });

  it("denies finance plus office when office has no assigned locations", () => {
    const assignments = [
      { role: "tenant_finance", locationIds: null },
      { role: "tenant_office", locationIds: [] },
    ];

    expect(canRunImport(["tenant_finance", "tenant_office"], undefined, assignments)).toBe(false);
    expect(resolveImportLocationIds(["tenant_finance", "tenant_office"], assignments)).toEqual([]);
  });

  it("does not expand scoped runners to all locations when finance is present", () => {
    const assignments = [
      { role: "tenant_finance", locationIds: null },
      { role: "tenant_office", locationIds: [locationNorth] },
    ];

    expect(
      resolveImportLocationIds(["tenant_finance", "tenant_office"], assignments),
    ).not.toBeUndefined();
    expect(
      resolveImportLocationIds(["tenant_finance", "tenant_office"], assignments),
    ).not.toContain(locationSouth);
  });

  it("honors non-empty location assignments on owner and admin roles", () => {
    const assignments = [{ role: "tenant_admin", locationIds: [locationNorth] }];

    expect(canRunImport(["tenant_admin"], undefined, assignments)).toBe(true);
    expect(resolveImportLocationIds(["tenant_admin"], assignments)).toEqual([locationNorth]);
    expect(resolveImportLocationIds(["tenant_admin"], assignments)).not.toContain(locationSouth);
  });

  it("returns all locations only when owner or admin has no location assignment", () => {
    expect(
      resolveImportLocationIds(
        ["tenant_admin"],
        [{ role: "tenant_admin", locationIds: [] }],
      ),
    ).toBeUndefined();
    expect(
      resolveImportLocationIds(
        ["tenant_owner"],
        [{ role: "tenant_owner", locationIds: null }],
      ),
    ).toBeUndefined();
  });
});
