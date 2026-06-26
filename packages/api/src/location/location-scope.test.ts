import { describe, expect, it } from "vitest";
import {
  buildLocationScopeFilter,
  hasAllLocationsAccess,
  hasNoLocationAccess,
  isWithinLocationScope,
} from "./location-scope";

describe("hasAllLocationsAccess", () => {
  it("treats undefined as all locations", () => {
    expect(hasAllLocationsAccess(undefined)).toBe(true);
  });

  it("treats empty arrays as scoped with no access", () => {
    expect(hasAllLocationsAccess([])).toBe(false);
    expect(hasNoLocationAccess([])).toBe(true);
  });
});

describe("isWithinLocationScope", () => {
  it("allows any location when scope is all locations", () => {
    expect(isWithinLocationScope("loc-1", undefined)).toBe(true);
  });

  it("denies all locations when scope is empty", () => {
    expect(isWithinLocationScope("loc-1", [])).toBe(false);
  });

  it("allows only assigned locations when scoped", () => {
    expect(isWithinLocationScope("loc-1", ["loc-1", "loc-2"])).toBe(true);
    expect(isWithinLocationScope("loc-3", ["loc-1", "loc-2"])).toBe(false);
  });
});

describe("buildLocationScopeFilter", () => {
  it("returns undefined for all-locations scope", () => {
    expect(buildLocationScopeFilter({} as never, undefined)).toBeUndefined();
  });

  it("returns a blocking filter for empty scoped assignments", () => {
    expect(buildLocationScopeFilter({} as never, [])).toBeDefined();
  });

  it("returns an inArray filter for scoped sessions", () => {
    const filter = buildLocationScopeFilter({} as never, ["loc-1"]);
    expect(filter).toBeDefined();
  });
});
