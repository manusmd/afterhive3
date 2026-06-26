import { describe, expect, it } from "vitest";
import { canReadLeads } from "./can-read-leads";

describe("canReadLeads", () => {
  it("allows owner, admin, office, finance, and location manager", () => {
    expect(canReadLeads(["tenant_owner"])).toBe(true);
    expect(canReadLeads(["tenant_admin"])).toBe(true);
    expect(canReadLeads(["office_staff"])).toBe(true);
    expect(canReadLeads(["tenant_finance"])).toBe(true);
    expect(canReadLeads(["tenant_location_manager"])).toBe(true);
  });

  it("denies coach and empty roles", () => {
    expect(canReadLeads(["tenant_coach"])).toBe(false);
    expect(canReadLeads([])).toBe(false);
  });
});
