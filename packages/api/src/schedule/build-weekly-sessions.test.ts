import { describe, expect, it } from "vitest";
import { parseLocalDateTimeInTimeZone } from "./timezone";
import {
  buildWeeklySessionOccurrences,
  isValidWeeklySingleDayRrule,
  parseWeeklyByDay,
} from "./build-weekly-sessions";

describe("isValidWeeklySingleDayRrule", () => {
  it("accepts a single weekly BYDAY", () => {
    expect(isValidWeeklySingleDayRrule("FREQ=WEEKLY;BYDAY=MO")).toBe(true);
    expect(isValidWeeklySingleDayRrule("BYDAY=MO;FREQ=WEEKLY")).toBe(true);
  });

  it("rejects multi-day weekly rules", () => {
    expect(isValidWeeklySingleDayRrule("FREQ=WEEKLY;BYDAY=MO,WE")).toBe(false);
  });

  it("rejects unsupported RRULE clauses", () => {
    expect(isValidWeeklySingleDayRrule("FREQ=WEEKLY;INTERVAL=2;BYDAY=MO")).toBe(false);
    expect(isValidWeeklySingleDayRrule("FREQ=WEEKLY;COUNT=3;BYDAY=MO")).toBe(false);
    expect(isValidWeeklySingleDayRrule("FREQ=WEEKLY;UNTIL=20251231T000000Z;BYDAY=MO")).toBe(
      false,
    );
  });

  it("rejects non-weekly rules", () => {
    expect(isValidWeeklySingleDayRrule("FREQ=DAILY;BYDAY=MO")).toBe(false);
  });
});

describe("parseWeeklyByDay", () => {
  it("parses weekly BYDAY", () => {
    expect(parseWeeklyByDay("FREQ=WEEKLY;BYDAY=MO")).toBe(1);
    expect(parseWeeklyByDay("FREQ=DAILY")).toBeNull();
  });
});

describe("buildWeeklySessionOccurrences", () => {
  it("generates exactly maxOccurrences weekly sessions", () => {
    const dtstart = new Date("2024-01-01T17:00:00.000Z");
    const occurrences = buildWeeklySessionOccurrences({
      dtstart,
      durationMinutes: 90,
      rrule: "FREQ=WEEKLY;BYDAY=MO",
      maxOccurrences: 3,
      timezone: "UTC",
    });

    expect(occurrences).toHaveLength(3);
    expect(occurrences[0]?.startsAt.toISOString()).toBe("2024-01-01T17:00:00.000Z");
    expect(occurrences[0]?.endsAt.toISOString()).toBe("2024-01-01T18:30:00.000Z");
    expect(occurrences[2]?.startsAt.toISOString()).toBe("2024-01-15T17:00:00.000Z");
  });

  it("does not produce an extra session when dtstart matches BYDAY", () => {
    const dtstart = new Date("2024-01-01T17:00:00.000Z");
    const occurrences = buildWeeklySessionOccurrences({
      dtstart,
      durationMinutes: 90,
      rrule: "FREQ=WEEKLY;BYDAY=MO",
      maxOccurrences: 8,
      timezone: "UTC",
    });

    expect(occurrences).toHaveLength(8);
    expect(occurrences[7]?.startsAt.toISOString()).toBe("2024-02-19T17:00:00.000Z");
  });

  it("preserves local wall-clock time in the configured timezone", () => {
    const dtstart = parseLocalDateTimeInTimeZone("2024-01-01T17:00:00", "Europe/Berlin");
    const occurrences = buildWeeklySessionOccurrences({
      dtstart: dtstart!,
      durationMinutes: 90,
      rrule: "FREQ=WEEKLY;BYDAY=MO",
      maxOccurrences: 2,
      timezone: "Europe/Berlin",
    });

    expect(occurrences[0]?.startsAt.toISOString()).toBe("2024-01-01T16:00:00.000Z");
    expect(occurrences[1]?.startsAt.toISOString()).toBe("2024-01-08T16:00:00.000Z");
  });
});
