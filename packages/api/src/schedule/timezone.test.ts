import { describe, expect, it } from "vitest";
import {
  addDaysInTimeZone,
  parseLocalDateTimeInTimeZone,
  zonedLocalDateTimeToUtc,
} from "./timezone";

describe("parseLocalDateTimeInTimeZone", () => {
  it("converts local wall-clock time to UTC", () => {
    const parsed = parseLocalDateTimeInTimeZone("2024-01-01T17:00:00", "Europe/Berlin");

    expect(parsed?.toISOString()).toBe("2024-01-01T16:00:00.000Z");
  });

  it("preserves explicit UTC instants", () => {
    const parsed = parseLocalDateTimeInTimeZone("2024-01-01T17:00:00.000Z", "Europe/Berlin");

    expect(parsed?.toISOString()).toBe("2024-01-01T17:00:00.000Z");
  });
});

describe("addDaysInTimeZone", () => {
  it("advances by seven local days while preserving local time", () => {
    const start = zonedLocalDateTimeToUtc(2024, 1, 1, 17, 0, 0, "Europe/Berlin");
    const next = addDaysInTimeZone(start, 7, "Europe/Berlin");

    expect(next.toISOString()).toBe("2024-01-08T16:00:00.000Z");
  });
});
