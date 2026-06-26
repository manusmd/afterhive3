import { describe, expect, it } from "vitest";
import { canCreateLocation, canViewLocations } from "./can-manage-locations";

describe("canViewLocations", () => {
  it("allows owner, admin, and location manager", () => {
    expect(canViewLocations(["tenant_owner"])).toBe(true);
    expect(canViewLocations(["tenant_admin"])).toBe(true);
    expect(canViewLocations(["tenant_location_manager"])).toBe(true);
  });

  it("denies office staff and coach", () => {
    expect(canViewLocations(["office_staff"])).toBe(false);
    expect(canViewLocations(["tenant_coach"])).toBe(false);
    expect(canViewLocations([])).toBe(false);
  });
});

describe("canCreateLocation", () => {
  it("allows owner and admin only", () => {
    expect(canCreateLocation(["tenant_owner"])).toBe(true);
    expect(canCreateLocation(["tenant_admin"])).toBe(true);
  });

  it("denies location manager and office staff", () => {
    expect(canCreateLocation(["tenant_location_manager"])).toBe(false);
    expect(canCreateLocation(["office_staff"])).toBe(false);
  });
});
