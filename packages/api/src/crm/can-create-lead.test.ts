import { describe, expect, it } from "vitest";
import { canCreateLead } from "./can-create-lead";

const locationNorth = "loc-north";

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
});
