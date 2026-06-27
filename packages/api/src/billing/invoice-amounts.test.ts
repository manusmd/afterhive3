import { describe, expect, it } from "vitest";
import {
  addDays,
  calculateAmountsFromNet,
  getCalendarMonthBounds,
  isContractActiveForPeriod,
  isContractActiveOnDate,
  parseVatRate,
  resolveIssueDate,
} from "./invoice-amounts";

describe("calculateAmountsFromNet", () => {
  it("calculates net, VAT, and gross for 19% rate", () => {
    expect(calculateAmountsFromNet(4500, 0.19)).toEqual({
      netCents: 4500,
      vatCents: 855,
      grossCents: 5355,
    });
  });

  it("rounds VAT to nearest cent", () => {
    expect(calculateAmountsFromNet(3333, 0.19)).toEqual({
      netCents: 3333,
      vatCents: 633,
      grossCents: 3966,
    });
  });
});

describe("billing period helpers", () => {
  it("builds calendar month bounds", () => {
    expect(getCalendarMonthBounds(2026, 7)).toEqual({
      servicePeriodStart: "2026-07-01",
      servicePeriodEnd: "2026-07-31",
    });
  });

  it("caps billing day to month length", () => {
    expect(resolveIssueDate(2026, 2, 31)).toBe("2026-02-28");
  });

  it("adds payment terms days", () => {
    expect(addDays("2026-07-01", 14)).toBe("2026-07-15");
  });

  it("checks contract coverage for service period", () => {
    expect(
      isContractActiveForPeriod("2026-06-01", null, "2026-07-01", "2026-07-31"),
    ).toBe(true);
    expect(
      isContractActiveForPeriod("2026-08-01", null, "2026-07-01", "2026-07-31"),
    ).toBe(false);
    expect(
      isContractActiveForPeriod("2026-01-01", "2026-06-30", "2026-07-01", "2026-07-31"),
    ).toBe(false);
  });

  it("checks contract coverage for a specific session date", () => {
    expect(isContractActiveOnDate("2026-07-15", null, "2026-07-01")).toBe(false);
    expect(isContractActiveOnDate("2026-07-01", null, "2026-07-01")).toBe(true);
    expect(isContractActiveOnDate("2026-06-01", "2026-07-15", "2026-07-16")).toBe(false);
  });

  it("parses VAT rate strings", () => {
    expect(parseVatRate("0.19")).toBe(0.19);
    expect(parseVatRate("invalid")).toBeNull();
  });
});
