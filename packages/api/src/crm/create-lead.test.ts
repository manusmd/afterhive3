import { describe, expect, it } from "vitest";
import { validateCreateLeadInput } from "./create-lead";

describe("validateCreateLeadInput", () => {
  it("accepts valid lead fields", () => {
    expect(
      validateCreateLeadInput({
        firstName: "Anna",
        lastName: "Nord",
        locationId: "loc-a",
      }),
    ).toEqual({
      ok: true,
      firstName: "Anna",
      lastName: "Nord",
      locationId: "loc-a",
      source: "manual",
    });
  });

  it("rejects missing required fields", () => {
    expect(
      validateCreateLeadInput({
        firstName: " ",
        lastName: "Nord",
        locationId: "loc-a",
      }),
    ).toEqual({ ok: false, code: "missing_fields" });
  });

  it("rejects names that exceed the max length", () => {
    expect(
      validateCreateLeadInput({
        firstName: "a".repeat(256),
        lastName: "Nord",
        locationId: "loc-a",
      }),
    ).toEqual({ ok: false, code: "too_long" });
  });
});
