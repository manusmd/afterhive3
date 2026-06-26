import { describe, expect, it } from "vitest";
import { canCreateOffer, resolveOfferCreateLocationIds } from "./can-create-offer";

const locationNorth = "loc-north";
const locationSouth = "loc-south";

describe("canCreateOffer", () => {
  it("allows owner and admin regardless of location scope", () => {
    expect(canCreateOffer(["tenant_owner"], undefined)).toBe(true);
    expect(canCreateOffer(["tenant_admin"], [])).toBe(true);
  });

  it("allows office and location manager with assigned locations", () => {
    expect(canCreateOffer(["tenant_office"], [locationNorth])).toBe(true);
    expect(canCreateOffer(["tenant_location_manager"], [locationNorth])).toBe(true);
  });

  it("denies office and location manager without assigned locations", () => {
    expect(canCreateOffer(["tenant_office"], [])).toBe(false);
    expect(canCreateOffer(["tenant_office"], undefined)).toBe(false);
    expect(canCreateOffer(["tenant_location_manager"], [])).toBe(false);
  });

  it("denies coach, finance, and legacy roles", () => {
    expect(canCreateOffer(["tenant_coach"], [locationNorth])).toBe(false);
    expect(canCreateOffer(["tenant_finance"], undefined)).toBe(false);
    expect(canCreateOffer(["office_staff"], [locationNorth])).toBe(false);
    expect(canCreateOffer([])).toBe(false);
  });

  it("does not expand scoped creators to all locations when finance is present", () => {
    const assignments = [
      { role: "tenant_finance", locationIds: null },
      { role: "tenant_office", locationIds: [locationNorth] },
    ];

    expect(canCreateOffer(["tenant_finance", "tenant_office"], undefined, assignments)).toBe(
      true,
    );
    expect(
      resolveOfferCreateLocationIds(["tenant_finance", "tenant_office"], assignments),
    ).toEqual([locationNorth]);
    expect(
      resolveOfferCreateLocationIds(["tenant_finance", "tenant_office"], assignments),
    ).not.toContain(locationSouth);
  });
});
