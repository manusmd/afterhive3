import { describe, expect, it } from "vitest";
import { isMinorAtDate, resolveInitialConsentStatus } from "./is-minor";

describe("isMinorAtDate", () => {
  it("returns true for a person under 18 on the reference date", () => {
    expect(isMinorAtDate(new Date("2010-06-01"), new Date("2026-06-26"))).toBe(true);
  });

  it("returns false for a person 18 or older on the reference date", () => {
    expect(isMinorAtDate(new Date("2008-06-01"), new Date("2026-06-26"))).toBe(false);
  });
});

describe("resolveInitialConsentStatus", () => {
  it("starts minors with pending consent", () => {
    expect(resolveInitialConsentStatus(new Date("2015-01-01"), new Date("2026-06-26"))).toBe(
      "pending",
    );
  });

  it("starts adults with complete consent", () => {
    expect(resolveInitialConsentStatus(new Date("1990-01-01"), new Date("2026-06-26"))).toBe(
      "complete",
    );
  });

  it("defaults missing date of birth to complete", () => {
    expect(resolveInitialConsentStatus(null, new Date("2026-06-26"))).toBe("complete");
  });
});
