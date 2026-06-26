import { describe, expect, it } from "vitest";
import { buildWeeklySessionOccurrences, parseWeeklyByDay } from "./build-weekly-sessions";

describe("parseWeeklyByDay", () => {
  it("parses weekly BYDAY", () => {
    expect(parseWeeklyByDay("FREQ=WEEKLY;BYDAY=MO")).toBe(1);
    expect(parseWeeklyByDay("FREQ=DAILY")).toBeNull();
  });
});

describe("buildWeeklySessionOccurrences", () => {
  it("generates weekly sessions through range end", () => {
    const dtstart = new Date("2024-01-01T17:00:00.000Z");
    const rangeEnd = new Date("2024-01-21T23:59:59.000Z");
    const occurrences = buildWeeklySessionOccurrences({
      dtstart,
      durationMinutes: 90,
      rrule: "FREQ=WEEKLY;BYDAY=MO",
      rangeEnd,
    });

    expect(occurrences).toHaveLength(3);
    expect(occurrences[0]?.startsAt.toISOString()).toBe("2024-01-01T17:00:00.000Z");
    expect(occurrences[0]?.endsAt.toISOString()).toBe("2024-01-01T18:30:00.000Z");
  });
});
