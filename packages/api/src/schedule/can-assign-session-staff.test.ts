import { describe, expect, it } from "vitest";
import { canAssignSessionStaff } from "./can-assign-session-staff";

const locationNorth = "loc-north";

describe("canAssignSessionStaff", () => {
  it("allows owner and admin regardless of location scope", () => {
    expect(canAssignSessionStaff(["tenant_owner"], undefined)).toBe(true);
    expect(canAssignSessionStaff(["tenant_admin"], [])).toBe(true);
  });

  it("allows office and location manager with assigned locations", () => {
    expect(canAssignSessionStaff(["tenant_office"], [locationNorth])).toBe(true);
    expect(canAssignSessionStaff(["tenant_location_manager"], [locationNorth])).toBe(true);
  });

  it("denies coach and office without assigned locations", () => {
    expect(canAssignSessionStaff(["tenant_office"], [])).toBe(false);
    expect(canAssignSessionStaff(["tenant_coach"], [locationNorth])).toBe(false);
  });
});
