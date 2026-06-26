import { describe, expect, it } from "vitest";
import { canMergePersons } from "./can-merge-persons";

describe("canMergePersons", () => {
  it("allows owner and admin", () => {
    expect(canMergePersons(["tenant_owner"])).toBe(true);
    expect(canMergePersons(["tenant_admin"])).toBe(true);
  });

  it("denies office, coach, finance, and location manager", () => {
    expect(canMergePersons(["tenant_office"])).toBe(false);
    expect(canMergePersons(["tenant_coach"])).toBe(false);
    expect(canMergePersons(["tenant_finance"])).toBe(false);
    expect(canMergePersons(["tenant_location_manager"])).toBe(false);
  });
});
