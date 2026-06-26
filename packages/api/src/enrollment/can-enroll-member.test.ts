import { describe, expect, it } from "vitest";
import { canEnrollMember } from "./can-enroll-member";

const locationNorth = "loc-north";

describe("canEnrollMember", () => {
  it("allows owner and admin regardless of location scope", () => {
    expect(canEnrollMember(["tenant_owner"], undefined)).toBe(true);
    expect(canEnrollMember(["tenant_admin"], [])).toBe(true);
  });

  it("allows office and location manager with assigned locations", () => {
    expect(canEnrollMember(["tenant_office"], [locationNorth])).toBe(true);
    expect(canEnrollMember(["tenant_location_manager"], [locationNorth])).toBe(true);
  });

  it("denies office without assigned locations", () => {
    expect(canEnrollMember(["tenant_office"], [])).toBe(false);
    expect(canEnrollMember(["tenant_coach"], [locationNorth])).toBe(false);
  });
});
