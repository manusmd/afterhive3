import { describe, expect, it } from "vitest";
import { canAnonymizePerson, resolveAnonymizeLocationIds } from "./can-anonymize-person";

const locationNorth = "loc-north";
const locationSouth = "loc-south";

describe("canAnonymizePerson", () => {
  it("allows owner and admin by default", () => {
    expect(canAnonymizePerson(["tenant_owner"])).toBe(true);
    expect(canAnonymizePerson(["tenant_admin"])).toBe(true);
  });

  it("denies office, finance, coach, and location manager", () => {
    expect(canAnonymizePerson(["tenant_office"])).toBe(false);
    expect(canAnonymizePerson(["tenant_finance"])).toBe(false);
    expect(canAnonymizePerson(["tenant_coach"])).toBe(false);
    expect(canAnonymizePerson(["tenant_location_manager"])).toBe(false);
  });

  it("honors location assignments on owner and admin roles", () => {
    const assignments = [{ role: "tenant_admin", locationIds: [locationNorth] }];

    expect(canAnonymizePerson(["tenant_admin"], undefined, assignments)).toBe(true);
    expect(resolveAnonymizeLocationIds(["tenant_admin"], assignments)).toEqual([locationNorth]);
    expect(resolveAnonymizeLocationIds(["tenant_admin"], assignments)).not.toContain(
      locationSouth,
    );
  });

  it("returns all locations only when owner or admin has no location assignment", () => {
    expect(
      resolveAnonymizeLocationIds(
        ["tenant_admin"],
        [{ role: "tenant_admin", locationIds: [] }],
      ),
    ).toBeUndefined();
    expect(
      resolveAnonymizeLocationIds(
        ["tenant_owner"],
        [{ role: "tenant_owner", locationIds: null }],
      ),
    ).toBeUndefined();
  });
});
