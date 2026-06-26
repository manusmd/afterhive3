import { describe, expect, it } from "vitest";
import { normalizeLocationName, validateLocationName } from "./location-name";

describe("validateLocationName", () => {
  it("accepts valid names", () => {
    expect(validateLocationName("Standort Nord")).toBeNull();
    expect(normalizeLocationName("  Hauptstandort  ")).toBe("Hauptstandort");
  });

  it("rejects empty and too long names", () => {
    expect(validateLocationName("   ")).toBe("empty");
    expect(validateLocationName("a".repeat(256))).toBe("too_long");
  });
});
