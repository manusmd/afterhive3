import { describe, expect, it } from "vitest";
import { validateCreateOfferInput } from "./create-offer";

describe("validateCreateOfferInput", () => {
  it("accepts weekly recurrence input", () => {
    expect(
      validateCreateOfferInput({
        name: "Kids course",
        type: "course",
        locationId: "loc-1",
        groupName: "Group A",
        capacity: 20,
        recurrence: {
          dtstart: "2024-01-01T17:00:00.000Z",
          durationMinutes: 90,
          rrule: "FREQ=WEEKLY;BYDAY=MO",
          timezone: "Europe/Berlin",
          generateWeeks: 8,
        },
      }),
    ).toBeNull();
  });

  it("rejects non-weekly recurrence", () => {
    expect(
      validateCreateOfferInput({
        name: "Kids course",
        type: "course",
        locationId: "loc-1",
        groupName: "Group A",
        capacity: 20,
        recurrence: {
          dtstart: "2024-01-01T17:00:00.000Z",
          durationMinutes: 90,
          rrule: "FREQ=DAILY",
          timezone: "Europe/Berlin",
          generateWeeks: 8,
        },
      }),
    ).toBe("invalid_recurrence");
  });
});
