import { describe, expect, it } from "vitest";
import { canRecordAttendance } from "./can-record-attendance";

describe("canRecordAttendance", () => {
  it("allows owner", () => {
    expect(canRecordAttendance(["tenant_owner"])).toBe(true);
  });

  it("allows coach at role level", () => {
    expect(canRecordAttendance(["tenant_coach"], ["loc-1"])).toBe(true);
  });

  it("allows scoped office with locations", () => {
    expect(
      canRecordAttendance(["tenant_office"], undefined, [
        { role: "tenant_office", locationIds: ["loc-1"] },
      ]),
    ).toBe(true);
  });

  it("denies finance", () => {
    expect(canRecordAttendance(["tenant_finance"])).toBe(false);
  });
});
