import { describe, expect, it } from "vitest";
import { canConvertLead, isLeadConvertibleStatus } from "./can-convert-lead";

describe("canConvertLead", () => {
  it("allows owner and admin without location scope", () => {
    expect(canConvertLead(["tenant_owner"])).toBe(true);
    expect(canConvertLead(["tenant_admin"])).toBe(true);
  });

  it("requires assigned locations for scoped office and location manager roles", () => {
    expect(canConvertLead(["tenant_office"], [])).toBe(false);
    expect(canConvertLead(["tenant_office"], ["loc-1"])).toBe(true);
    expect(canConvertLead(["tenant_location_manager"], ["loc-1"])).toBe(true);
  });

  it("denies finance and coach", () => {
    expect(canConvertLead(["tenant_finance"], ["loc-1"])).toBe(false);
    expect(canConvertLead(["tenant_coach"], ["loc-1"])).toBe(false);
  });

  it("uses role assignments for mixed scoped access", () => {
    expect(
      canConvertLead(["tenant_admin", "tenant_office"], undefined, [
        { role: "tenant_admin", locationIds: [] },
        { role: "tenant_office", locationIds: ["loc-north"] },
      ]),
    ).toBe(true);

    expect(
      canConvertLead(["tenant_office"], undefined, [
        { role: "tenant_office", locationIds: ["loc-north"] },
      ]),
    ).toBe(true);

    expect(
      canConvertLead(["tenant_office"], undefined, [{ role: "tenant_office", locationIds: [] }]),
    ).toBe(false);
  });
});

describe("isLeadConvertibleStatus", () => {
  it("allows only qualified leads", () => {
    expect(isLeadConvertibleStatus("qualified")).toBe(true);
    expect(isLeadConvertibleStatus("new")).toBe(false);
    expect(isLeadConvertibleStatus("converted")).toBe(false);
  });
});
