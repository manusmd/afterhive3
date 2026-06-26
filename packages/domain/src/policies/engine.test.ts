import { afterEach, describe, expect, it } from "vitest";
import { can, registerPolicy, resetPolicies } from "./engine";
import type { Action, ResourceRef, SessionContext } from "./types";

const ctx: SessionContext = {
  userId: "user-1",
  surface: "platform",
  roles: ["platform_superadmin"],
};

const resource: ResourceRef = { type: "tenant", id: "tenant-1" };
const action: Action = "create";

afterEach(() => {
  resetPolicies();
});

describe("can", () => {
  it("denies when no policies are registered", () => {
    expect(can(ctx, action, resource)).toEqual({
      allowed: false,
      reason: "no_matching_policy",
    });
  });

  it("returns the first denying handler result", () => {
    registerPolicy(() => ({ allowed: false, reason: "denied_by_test" }));
    registerPolicy(() => ({ allowed: true }));

    expect(can(ctx, action, resource)).toEqual({
      allowed: false,
      reason: "denied_by_test",
    });
  });

  it("allows when all handlers allow", () => {
    registerPolicy(() => ({ allowed: true }));
    registerPolicy(() => ({ allowed: true }));

    expect(can(ctx, action, resource)).toEqual({
      allowed: false,
      reason: "no_matching_policy",
    });
  });
});
