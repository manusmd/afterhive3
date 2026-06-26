import { describe, expect, it } from "vitest";
import {
  buildLocationScopeFilter,
  hasAllLocationsAccess,
  isWithinLocationScope,
} from "./location-scope";

describe("hasAllLocationsAccess", () => {
  it("treats undefined and empty arrays as all locations", () => {
    expect(hasAllLocationsAccess(undefined)).toBe(true);
    expect(hasAllLocationsAccess([])).toBe(true);
  });

  it("treats non-empty arrays as scoped", () => {
    expect(hasAllLocationsAccess(["loc-1"])).toBe(false);
  });
});

describe("isWithinLocationScope", () => {
  it("allows any location when scope is all locations", () => {
    expect(isWithinLocationScope("loc-1", undefined)).toBe(true);
    expect(isWithinLocationScope("loc-1", [])).toBe(true);
  });

  it("allows only assigned locations when scoped", () => {
    expect(isWithinLocationScope("loc-1", ["loc-1", "loc-2"])).toBe(true);
    expect(isWithinLocationScope("loc-3", ["loc-1", "loc-2"])).toBe(false);
  });
});

describe("buildLocationScopeFilter", () => {
  it("returns undefined for all-locations scope", () => {
    expect(buildLocationScopeFilter({} as never, undefined)).toBeUndefined();
    expect(buildLocationScopeFilter({} as never, [])).toBeUndefined();
  });

  it("returns an inArray filter for scoped sessions", () => {
    const filter = buildLocationScopeFilter({} as never, ["loc-1"]);
    expect(filter).toBeDefined();
  });
});
