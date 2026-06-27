import { describe, expect, it } from "vitest";
import { shouldBillAttendanceStatus } from "./tariff-snapshot";

describe("shouldBillAttendanceStatus", () => {
  it("bills present and late when absent is not billed", () => {
    expect(shouldBillAttendanceStatus("present", false)).toBe(true);
    expect(shouldBillAttendanceStatus("late", false)).toBe(true);
    expect(shouldBillAttendanceStatus("absent", false)).toBe(false);
    expect(shouldBillAttendanceStatus("excused", false)).toBe(false);
  });

  it("bills excused when bill_absent is true", () => {
    expect(shouldBillAttendanceStatus("excused", true)).toBe(true);
    expect(shouldBillAttendanceStatus("absent", true)).toBe(false);
  });
});
