import { describe, expect, it } from "vitest";
import {
  buildWeeklySessionOccurrences,
  isValidWeeklySingleDayRrule,
  parseWeeklyByDay,
} from "./build-weekly-sessions";

describe("isValidWeeklySingleDayRrule", () => {
  it("accepts a single weekly BYDAY", () => {
    expect(isValidWeeklySingleDayRrule("FREQ=WEEKLY;BYDAY=MO")).toBe(true);
  });

  it("rejects multi-day weekly rules", () => {
    expect(isValidWeeklySingleDayRrule("FREQ=WEEKLY;BYDAY=MO,WE")).toBe(false);
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
    });

    expect(occurrences).toHaveLength(8);
    expect(occurrences[7]?.startsAt.toISOString()).toBe("2024-02-19T17:00:00.000Z");
  });
});
