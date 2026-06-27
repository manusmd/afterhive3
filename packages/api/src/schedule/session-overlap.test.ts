import { describe, expect, it } from "vitest";
import { sessionsOverlap } from "./session-overlap";

describe("sessionsOverlap", () => {
  it("detects overlapping ranges", () => {
    const start = new Date("2026-06-26T17:00:00.000Z");
    const end = new Date("2026-06-26T18:30:00.000Z");
    const otherStart = new Date("2026-06-26T18:00:00.000Z");
    const otherEnd = new Date("2026-06-26T19:00:00.000Z");

    expect(sessionsOverlap(start, end, otherStart, otherEnd)).toBe(true);
  });

  it("returns false for adjacent non-overlapping ranges", () => {
    const start = new Date("2026-06-26T17:00:00.000Z");
    const end = new Date("2026-06-26T18:00:00.000Z");
    const otherStart = new Date("2026-06-26T18:00:00.000Z");
    const otherEnd = new Date("2026-06-26T19:00:00.000Z");

    expect(sessionsOverlap(start, end, otherStart, otherEnd)).toBe(false);
  });
});
