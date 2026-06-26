import { describe, expect, it } from "vitest";
import { canCreateLead, resolveLeadCreateLocationIds } from "./can-create-lead";

const locationNorth = "loc-north";
const locationSouth = "loc-south";

describe("canCreateLead", () => {
  it("allows owner, admin, office, and location manager with scope", () => {
    expect(canCreateLead(["tenant_owner"], undefined)).toBe(true);
    expect(canCreateLead(["tenant_admin"], [])).toBe(true);
    expect(canCreateLead(["tenant_office"], [locationNorth])).toBe(true);
    expect(canCreateLead(["tenant_location_manager"], [locationNorth])).toBe(true);
  });

  it("denies finance, coach, and scoped roles without locations", () => {
    expect(canCreateLead(["tenant_finance"], undefined)).toBe(false);
    expect(canCreateLead(["tenant_coach"], [locationNorth])).toBe(false);
    expect(canCreateLead(["tenant_office"], [])).toBe(false);
    expect(canCreateLead(["tenant_office"], undefined)).toBe(false);
  });

  it("does not grant create from finance mixed with scoped creator roles", () => {
    const assignments = [
      { role: "tenant_finance", locationIds: null },
      { role: "tenant_office", locationIds: [locationNorth] },
    ];

    expect(canCreateLead(["tenant_finance", "tenant_office"], undefined, assignments)).toBe(
      true,
    );
    expect(
      resolveLeadCreateLocationIds(["tenant_finance", "tenant_office"], assignments),
    ).toEqual([locationNorth]);
  });

  it("denies finance plus office when office has no assigned locations", () => {
    const assignments = [
      { role: "tenant_finance", locationIds: null },
      { role: "tenant_office", locationIds: [] },
    ];

    expect(canCreateLead(["tenant_finance", "tenant_office"], undefined, assignments)).toBe(
      false,
    );
    expect(
      resolveLeadCreateLocationIds(["tenant_finance", "tenant_office"], assignments),
    ).toEqual([]);
  });

  it("does not expand scoped creators to all locations when finance is present", () => {
    const assignments = [
      { role: "tenant_finance", locationIds: null },
      { role: "tenant_office", locationIds: [locationNorth] },
    ];

    expect(
      resolveLeadCreateLocationIds(["tenant_finance", "tenant_office"], assignments),
    ).not.toBeUndefined();
    expect(
      resolveLeadCreateLocationIds(["tenant_finance", "tenant_office"], assignments),
    ).not.toContain(locationSouth);
  });

  it("honors non-empty location assignments on owner and admin roles", () => {
    const assignments = [{ role: "tenant_admin", locationIds: [locationNorth] }];

    expect(canCreateLead(["tenant_admin"], undefined, assignments)).toBe(true);
    expect(resolveLeadCreateLocationIds(["tenant_admin"], assignments)).toEqual([
      locationNorth,
    ]);
    expect(resolveLeadCreateLocationIds(["tenant_admin"], assignments)).not.toContain(
      locationSouth,
    );
  });

  it("returns all locations only when owner or admin has no location assignment", () => {
    expect(
      resolveLeadCreateLocationIds(
        ["tenant_admin"],
        [{ role: "tenant_admin", locationIds: [] }],
      ),
    ).toBeUndefined();
    expect(
      resolveLeadCreateLocationIds(
        ["tenant_owner"],
        [{ role: "tenant_owner", locationIds: null }],
      ),
    ).toBeUndefined();
  });
});
