import { describe, expect, it } from "vitest";
import { canSuspendTenant } from "./can-suspend-tenant";

describe("canSuspendTenant", () => {
  it("allows platform_superadmin", () => {
    expect(canSuspendTenant(["platform_superadmin"])).toBe(true);
  });

  it("denies other platform and tenant roles", () => {
    expect(canSuspendTenant(["platform_support"])).toBe(false);
    expect(canSuspendTenant(["platform_finance"])).toBe(false);
    expect(canSuspendTenant(["tenant_owner"])).toBe(false);
    expect(canSuspendTenant([])).toBe(false);
  });
});
