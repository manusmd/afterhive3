import { beforeEach, describe, expect, it, vi } from "vitest";
import { GenerateSessionsError, generateSessions } from "./generate-sessions";

const tenantId = "tenant-1";
const tenantSlug = "demo-club";
const offerGroupId = "group-1";
const locationId = "loc-1";

const dtstart = new Date("2024-01-01T17:00:00.000Z");
const existingStartsAt = new Date("2024-01-01T17:00:00.000Z");

const onConflictDoNothing = vi.hoisted(() => vi.fn());

function mockDbChain(existingSessionStartsAt: Date[] = [existingStartsAt]) {
  let selectCall = 0;

  return {
    select: () => ({
      from: () => ({
        where: () => {
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
      values: () => ({
        onConflictDoNothing,
      }),
    }),
  };
}

describe("generateSessions", () => {
  beforeEach(() => {
    onConflictDoNothing.mockReset();
    onConflictDoNothing.mockResolvedValue(undefined);
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

  it("rejects weekly recurrence with unsupported clauses", async () => {
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
                    rrule: "FREQ=WEEKLY;INTERVAL=2;BYDAY=MO",
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
    expect(onConflictDoNothing).toHaveBeenCalledTimes(1);
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
    expect(onConflictDoNothing).not.toHaveBeenCalled();
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
