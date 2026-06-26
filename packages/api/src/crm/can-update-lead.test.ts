import { describe, expect, it } from "vitest";
import { canUpdateLeadStatus } from "./can-update-lead";

describe("canUpdateLeadStatus", () => {
  it("allows owner and admin without location scope", () => {
    expect(canUpdateLeadStatus(["tenant_owner"])).toBe(true);
    expect(canUpdateLeadStatus(["tenant_admin"])).toBe(true);
  });

  it("requires assigned locations for scoped roles", () => {
    expect(canUpdateLeadStatus(["tenant_office"], [])).toBe(false);
    expect(canUpdateLeadStatus(["tenant_office"], ["loc-1"])).toBe(true);
  });

  it("denies finance and coach", () => {
    expect(canUpdateLeadStatus(["tenant_finance"], ["loc-1"])).toBe(false);
    expect(canUpdateLeadStatus(["tenant_coach"], ["loc-1"])).toBe(false);
  });
});
