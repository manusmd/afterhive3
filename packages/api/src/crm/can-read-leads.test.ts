import { describe, expect, it } from "vitest";
import { canReadLeads } from "./can-read-leads";

const locationNorth = "loc-north";

describe("canReadLeads", () => {
  it("allows owner, admin, and finance regardless of location scope", () => {
    expect(canReadLeads(["tenant_owner"], undefined)).toBe(true);
    expect(canReadLeads(["tenant_admin"], [])).toBe(true);
    expect(canReadLeads(["tenant_finance"], undefined)).toBe(true);
  });

  it("allows assigned-location roles only with non-empty location scope", () => {
    expect(canReadLeads(["tenant_office"], [locationNorth])).toBe(true);
    expect(canReadLeads(["tenant_location_manager"], [locationNorth])).toBe(true);
    expect(canReadLeads(["tenant_office"], [])).toBe(false);
    expect(canReadLeads(["tenant_office"], undefined)).toBe(false);
  });

  it("denies coach, legacy office_staff, and empty roles", () => {
    expect(canReadLeads(["tenant_coach"], [locationNorth])).toBe(false);
    expect(canReadLeads(["office_staff"], [locationNorth])).toBe(false);
    expect(canReadLeads([])).toBe(false);
  });
});
