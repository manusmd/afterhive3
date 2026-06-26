import { describe, expect, it } from "vitest";
import { canReadPersons } from "./can-read-persons";

const locationNorth = "loc-north";

describe("canReadPersons", () => {
  it("allows owner, admin, and finance by default", () => {
    expect(canReadPersons(["tenant_owner"], undefined)).toBe(true);
    expect(canReadPersons(["tenant_admin"], [])).toBe(true);
    expect(canReadPersons(["tenant_finance"], undefined)).toBe(true);
  });

  it("requires assigned locations for scoped roles", () => {
    expect(canReadPersons(["tenant_office"], [])).toBe(false);
    expect(canReadPersons(["tenant_office"], [locationNorth])).toBe(true);
    expect(canReadPersons(["tenant_location_manager"], [locationNorth])).toBe(true);
  });

  it("denies coach until team or session scoping exists", () => {
    expect(canReadPersons(["tenant_coach"], [locationNorth])).toBe(false);
  });
});
