import { describe, expect, it } from "vitest";
import { canRecordPayment } from "./can-record-payment";

describe("canRecordPayment", () => {
  it("allows owner, admin, and finance", () => {
    expect(canRecordPayment(["tenant_owner"])).toBe(true);
    expect(canRecordPayment(["tenant_admin"])).toBe(true);
    expect(canRecordPayment(["tenant_finance"])).toBe(true);
  });

  it("denies office and coach", () => {
    expect(canRecordPayment(["tenant_office"])).toBe(false);
    expect(canRecordPayment(["tenant_coach"])).toBe(false);
  });
});
