import { beforeEach, describe, expect, it, vi } from "vitest";
import { GenerateSessionsError, generateSessions } from "./generate-sessions";

const tenantId = "tenant-1";
const tenantSlug = "demo-club";
const offerGroupId = "group-1";
const locationId = "loc-1";

const dtstart = new Date("2024-01-01T17:00:00.000Z");
const existingStartsAt = new Date("2024-01-01T17:00:00.000Z");

const insert = vi.hoisted(() => vi.fn());

function mockDbChain(existingSessionStartsAt: Date[] = [existingStartsAt]) {
  let selectCall = 0;

  return {
    select: () => ({
      from: () => ({
        where: (condition?: unknown) => {
          selectCall += 1;

          if (selectCall === 1) {
            return {
              limit: () => Promise.resolve([{ id: tenantId }]),
            };
          }

          if (selectCall === 2) {
            return {
              limit: () =>
                Promise.resolve([
                  {
                    id: offerGroupId,
                    locationId,
                  },
                ]),
            };
          }

          if (selectCall === 3) {
            return {
              limit: () =>
                Promise.resolve([
                  {
                    rrule: "FREQ=WEEKLY;BYDAY=MO",
                    dtstart,
                    durationMinutes: 90,
                  },
                ]),
            };
          }

          return Promise.resolve(
            existingSessionStartsAt.map((startsAt) => ({ startsAt })),
          );
        },
      }),
    }),
    insert: () => ({
      values: insert,
    }),
  };
}

describe("generateSessions", () => {
  beforeEach(() => {
    insert.mockReset();
    insert.mockResolvedValue(undefined);
  });

  it("rejects multi-day weekly recurrence", async () => {
    let selectCall = 0;
    const db = {
      select: () => ({
        from: () => ({
          where: () => {
            selectCall += 1;

            if (selectCall <= 2) {
              return {
                limit: () =>
                  Promise.resolve([
                    selectCall === 1
                      ? { id: tenantId }
                      : { id: offerGroupId, locationId },
                  ]),
              };
            }

            return {
              limit: () =>
                Promise.resolve([
                  {
                    rrule: "FREQ=WEEKLY;BYDAY=MO,WE",
                    dtstart,
                    durationMinutes: 90,
                  },
                ]),
            };
          },
        }),
      }),
    };

    await expect(
      generateSessions(db as never, {
        tenantId,
        tenantSlug,
        offerGroupId,
        maxOccurrences: 2,
      }),
    ).rejects.toMatchObject({ code: "invalid_recurrence" });
  });

  it("skips sessions that already exist for the same starts_at", async () => {
    const db = mockDbChain([existingStartsAt]);

    const insertedCount = await generateSessions(db as never, {
      tenantId,
      tenantSlug,
      offerGroupId,
      maxOccurrences: 2,
    });

    expect(insertedCount).toBe(1);
    expect(insert).toHaveBeenCalledTimes(1);
    expect(insert.mock.calls[0]?.[0]).toHaveLength(1);
    expect(insert.mock.calls[0]?.[0]?.[0]?.startsAt.toISOString()).toBe(
      "2024-01-08T17:00:00.000Z",
    );
  });

  it("returns zero without inserting when all occurrences already exist", async () => {
    const db = mockDbChain([existingStartsAt, new Date("2024-01-08T17:00:00.000Z")]);

    const insertedCount = await generateSessions(db as never, {
      tenantId,
      tenantSlug,
      offerGroupId,
      maxOccurrences: 2,
    });

    expect(insertedCount).toBe(0);
    expect(insert).not.toHaveBeenCalled();
  });

  it("throws when tenant is missing", async () => {
    const db = {
      select: () => ({
        from: () => ({
          where: () => ({
            limit: () => Promise.resolve([]),
          }),
        }),
      }),
    };

    await expect(
      generateSessions(db as never, {
        tenantId,
        tenantSlug,
        offerGroupId,
        maxOccurrences: 2,
      }),
    ).rejects.toBeInstanceOf(GenerateSessionsError);
  });
});
