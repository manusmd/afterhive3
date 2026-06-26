import { describe, expect, it } from "vitest";
import {
  canReopenLostLead,
  canTransitionLeadStatus,
  getAllowedLeadTransitions,
  requiresAdminReopen,
  requiresLostReason,
} from "./lead-status";

describe("lead status transitions", () => {
  it("allows pipeline transitions from the state machine", () => {
    expect(getAllowedLeadTransitions("new")).toEqual(["contacted", "lost"]);
    expect(getAllowedLeadTransitions("contacted")).toEqual(["qualified", "lost"]);
    expect(getAllowedLeadTransitions("qualified")).toEqual(["lost"]);
    expect(getAllowedLeadTransitions("converted")).toEqual([]);
    expect(getAllowedLeadTransitions("lost")).toEqual(["new"]);
  });

  it("validates transitions", () => {
    expect(canTransitionLeadStatus("new", "contacted")).toBe(true);
    expect(canTransitionLeadStatus("new", "qualified")).toBe(false);
    expect(canTransitionLeadStatus("qualified", "converted")).toBe(false);
    expect(canTransitionLeadStatus("lost", "new")).toBe(true);
  });

  it("requires lost reason when marking lost", () => {
    expect(requiresLostReason("lost")).toBe(true);
    expect(requiresLostReason("contacted")).toBe(false);
  });

  it("restricts reopen to admin roles", () => {
    expect(requiresAdminReopen("lost", "new")).toBe(true);
    expect(canReopenLostLead(["tenant_owner"])).toBe(true);
    expect(canReopenLostLead(["tenant_office"])).toBe(false);
  });
});
