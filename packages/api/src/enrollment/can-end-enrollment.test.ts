import { describe, expect, it } from "vitest";
import { canEndEnrollment } from "./can-end-enrollment";

const locationNorth = "loc-north";

describe("canEndEnrollment", () => {
  it("allows owner and admin regardless of location scope", () => {
    expect(canEndEnrollment(["tenant_owner"], undefined)).toBe(true);
    expect(canEndEnrollment(["tenant_admin"], [])).toBe(true);
  });

  it("allows office and location manager with assigned locations", () => {
    expect(canEndEnrollment(["tenant_office"], [locationNorth])).toBe(true);
    expect(canEndEnrollment(["tenant_location_manager"], [locationNorth])).toBe(true);
  });

  it("denies office without assigned locations", () => {
    expect(canEndEnrollment(["tenant_office"], [])).toBe(false);
    expect(canEndEnrollment(["tenant_coach"], [locationNorth])).toBe(false);
  });
});
