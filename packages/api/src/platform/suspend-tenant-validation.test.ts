import { describe, expect, it } from "vitest";
import { getSuspendTenantBlockReason } from "./suspend-tenant-validation";

describe("getSuspendTenantBlockReason", () => {
  it("allows trial and active tenants", () => {
    expect(getSuspendTenantBlockReason("trial")).toBeNull();
    expect(getSuspendTenantBlockReason("active")).toBeNull();
  });

  it("blocks suspended and closed tenants", () => {
    expect(getSuspendTenantBlockReason("suspended")).toBe("already_suspended");
    expect(getSuspendTenantBlockReason("closed")).toBe("already_closed");
  });
});
