import { describe, expect, it } from "vitest";
import { canActivateEnrollment } from "./can-activate-enrollment";

describe("canActivateEnrollment", () => {
  it("allows adults even when consent is pending", () => {
    expect(
      canActivateEnrollment({
        dateOfBirth: new Date("1990-01-01"),
        consentStatus: "pending",
        enrollmentDate: new Date("2026-06-26T12:00:00.000Z"),
      }),
    ).toBe(true);
  });

  it("blocks minors with pending consent", () => {
    expect(
      canActivateEnrollment({
        dateOfBirth: new Date("2015-01-01"),
        consentStatus: "pending",
        enrollmentDate: new Date("2026-06-26T12:00:00.000Z"),
      }),
    ).toBe(false);
  });

  it("allows minors with complete consent", () => {
    expect(
      canActivateEnrollment({
        dateOfBirth: new Date("2015-01-01"),
        consentStatus: "complete",
        enrollmentDate: new Date("2026-06-26T12:00:00.000Z"),
      }),
    ).toBe(true);
  });

  it("allows activation when date of birth is unknown", () => {
    expect(
      canActivateEnrollment({
        dateOfBirth: null,
        consentStatus: "pending",
        enrollmentDate: new Date("2026-06-26T12:00:00.000Z"),
      }),
    ).toBe(true);
  });

  it("blocks activation when enrolled as a minor even if activation would be after 18th birthday", () => {
    expect(
      canActivateEnrollment({
        dateOfBirth: new Date("2008-06-27"),
        consentStatus: "pending",
        enrollmentDate: new Date("2026-06-26T12:00:00.000Z"),
      }),
    ).toBe(false);
  });
});
