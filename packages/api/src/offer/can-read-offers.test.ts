import { describe, expect, it } from "vitest";
import { canReadOffers } from "./can-read-offers";

const locationNorth = "loc-north";

describe("canReadOffers", () => {
  it("allows owner, admin, and finance regardless of location scope", () => {
    expect(canReadOffers(["tenant_owner"], undefined)).toBe(true);
    expect(canReadOffers(["tenant_admin"], [])).toBe(true);
    expect(canReadOffers(["tenant_finance"], undefined)).toBe(true);
  });

  it("allows assigned-location roles only with non-empty location scope", () => {
    expect(canReadOffers(["tenant_office"], [locationNorth])).toBe(true);
    expect(canReadOffers(["tenant_coach"], [locationNorth])).toBe(true);
    expect(canReadOffers(["tenant_location_manager"], [locationNorth])).toBe(true);
    expect(canReadOffers(["tenant_office"], [])).toBe(false);
    expect(canReadOffers(["tenant_coach"], undefined)).toBe(false);
  });

  it("denies legacy office_staff and empty roles", () => {
    expect(canReadOffers(["office_staff"], [locationNorth])).toBe(false);
    expect(canReadOffers([])).toBe(false);
  });
});
