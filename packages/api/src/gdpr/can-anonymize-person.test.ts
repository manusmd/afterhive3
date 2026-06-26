import { beforeEach, describe, expect, it } from "vitest";
import { canAnonymizePerson } from "./can-anonymize-person";

describe("canAnonymizePerson", () => {
  it("allows owner and admin", () => {
    expect(canAnonymizePerson(["tenant_owner"])).toBe(true);
    expect(canAnonymizePerson(["tenant_admin"])).toBe(true);
  });

  it("denies office, finance, coach, and location manager", () => {
    expect(canAnonymizePerson(["tenant_office"])).toBe(false);
    expect(canAnonymizePerson(["tenant_finance"])).toBe(false);
    expect(canAnonymizePerson(["tenant_coach"])).toBe(false);
    expect(canAnonymizePerson(["tenant_location_manager"])).toBe(false);
  });
});
