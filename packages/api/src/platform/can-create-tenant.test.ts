import { describe, expect, it } from "vitest";
import { canCreateTenant } from "./can-create-tenant";

describe("canCreateTenant", () => {
  it("allows platform_superadmin", () => {
    expect(canCreateTenant(["platform_superadmin"])).toBe(true);
  });

  it("denies tenant and support roles", () => {
    expect(canCreateTenant(["tenant_owner"])).toBe(false);
    expect(canCreateTenant(["platform_support"])).toBe(false);
    expect(canCreateTenant([])).toBe(false);
  });
});
