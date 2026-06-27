import { describe, expect, it } from "vitest";
import {
  countSessionsOnDate,
  parseUpcomingSessions,
} from "./dashboard-upcoming-sessions";

describe("parseUpcomingSessions", () => {
  it("returns future sessions with parsed titles and timestamps", () => {
    const future = new Date(Date.now() + 60_000).toISOString();
    const past = new Date(Date.now() - 60_000).toISOString();

    expect(
      parseUpcomingSessions([
        { sessionId: "past", label: `Yoga · Montag · ${past}` },
        { sessionId: "future", label: `Yoga · Montag · ${future}` },
      ]),
    ).toEqual([
      {
        sessionId: "future",
        title: "Yoga · Montag",
        startsAt: new Date(future),
      },
    ]);
  });
});

describe("countSessionsOnDate", () => {
  it("counts sessions on the same calendar day in the target timezone", () => {
    const sessions = [
      {
        sessionId: "1",
        title: "A",
        startsAt: new Date("2026-06-27T08:00:00.000Z"),
      },
      {
        sessionId: "2",
        title: "B",
        startsAt: new Date("2026-06-28T08:00:00.000Z"),
      },
    ];

    expect(
      countSessionsOnDate(sessions, new Date("2026-06-27T12:00:00.000Z"), "Europe/Berlin"),
    ).toBe(1);
  });
});
