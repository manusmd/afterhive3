import { describe, expect, it } from "vitest";
import { canReadRoster } from "./can-read-roster";
import { canUpdateRoster } from "./can-update-roster";

describe("canUpdateRoster", () => {
  it("allows owner", () => {
    expect(canUpdateRoster(["tenant_owner"])).toBe(true);
  });

  it("denies coach", () => {
    expect(canUpdateRoster(["tenant_coach"], ["loc-1"])).toBe(false);
  });

  it("allows scoped office with locations", () => {
    expect(
      canUpdateRoster(["tenant_office"], undefined, [
        { role: "tenant_office", locationIds: ["loc-1"] },
      ]),
    ).toBe(true);
  });
});

describe("coach roster write before trainer assignment (MAN-192)", () => {
  it("denies coach until trainer team assignment is implemented", () => {
    expect(
      canUpdateRoster(["tenant_coach"], ["loc-1"], [
        { role: "tenant_coach", locationIds: ["loc-1"] },
      ]),
    ).toBe(false);
  });
});

describe("canReadRoster", () => {
  it("allows coach with locations", () => {
    expect(
      canReadRoster(["tenant_coach"], undefined, [
        { role: "tenant_coach", locationIds: ["loc-1"] },
      ]),
    ).toBe(true);
  });
});
