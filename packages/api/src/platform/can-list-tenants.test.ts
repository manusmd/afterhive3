import { describe, expect, it } from "vitest";
import { canListTenants } from "./can-list-tenants";

describe("canListTenants", () => {
  it("allows platform staff roles", () => {
    expect(canListTenants(["platform_superadmin"])).toBe(true);
    expect(canListTenants(["platform_support"])).toBe(true);
    expect(canListTenants(["platform_finance"])).toBe(true);
  });

  it("denies tenant roles", () => {
    expect(canListTenants(["tenant_owner"])).toBe(false);
    expect(canListTenants(["office_staff"])).toBe(false);
    expect(canListTenants([])).toBe(false);
  });
});
