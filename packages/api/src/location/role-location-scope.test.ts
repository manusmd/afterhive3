import { describe, expect, it } from "vitest";
import {
  requiresAssignedLocations,
  resolveSessionLocationIds,
  validateStaffRoleLocations,
} from "./role-location-scope";

describe("validateStaffRoleLocations", () => {
  it("requires locations for assigned-location roles", () => {
    expect(validateStaffRoleLocations("tenant_office", [])).toEqual({
      ok: false,
      code: "locations_required",
    });
    expect(validateStaffRoleLocations("tenant_location_manager")).toEqual({
      ok: false,
      code: "locations_required",
    });
  });

  it("allows all-location roles without selected locations", () => {
    expect(validateStaffRoleLocations("tenant_owner")).toEqual({ ok: true });
    expect(validateStaffRoleLocations("tenant_admin", [])).toEqual({ ok: true });
  });
});

describe("resolveSessionLocationIds", () => {
  it("returns undefined for owner/admin/finance with empty assignment", () => {
    expect(
      resolveSessionLocationIds([{ role: "tenant_owner", locationIds: [] }]),
    ).toBeUndefined();
    expect(
      resolveSessionLocationIds([{ role: "tenant_finance", locationIds: null }]),
    ).toBeUndefined();
  });

  it("returns assigned ids for office staff", () => {
    expect(
      resolveSessionLocationIds([
        { role: "tenant_office", locationIds: ["loc-a", "loc-b"] },
      ]),
    ).toEqual(["loc-a", "loc-b"]);
  });

  it("returns empty array when scoped roles have no locations", () => {
    expect(
      resolveSessionLocationIds([{ role: "tenant_office", locationIds: [] }]),
    ).toEqual([]);
    expect(
      resolveSessionLocationIds([
        { role: "tenant_location_manager", locationIds: null },
      ]),
    ).toEqual([]);
  });

  it("prefers unrestricted all-location access over scoped assignments", () => {
    expect(
      resolveSessionLocationIds([
        { role: "tenant_office", locationIds: ["loc-a"] },
        { role: "tenant_admin", locationIds: [] },
      ]),
    ).toBeUndefined();
  });
});

describe("requiresAssignedLocations", () => {
  it("marks office, coach, and location manager as assigned-location roles", () => {
    expect(requiresAssignedLocations("tenant_office")).toBe(true);
    expect(requiresAssignedLocations("tenant_coach")).toBe(true);
    expect(requiresAssignedLocations("tenant_location_manager")).toBe(true);
    expect(requiresAssignedLocations("tenant_owner")).toBe(false);
  });
});
