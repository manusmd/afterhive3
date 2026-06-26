import { describe, expect, it } from "vitest";
import { canCreateOffer } from "./can-create-offer";

describe("canCreateOffer", () => {
  it("allows owner and admin", () => {
    expect(canCreateOffer(["tenant_owner"])).toBe(true);
    expect(canCreateOffer(["tenant_admin"])).toBe(true);
  });

  it("denies office staff", () => {
    expect(canCreateOffer(["tenant_office"])).toBe(false);
  });
});
