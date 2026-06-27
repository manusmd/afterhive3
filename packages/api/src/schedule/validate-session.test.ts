import { beforeEach, describe, expect, it, vi } from "vitest";
import { findStaffDoubleBookConflicts } from "./validate-session";

describe("findStaffDoubleBookConflicts", () => {
  const select = vi.fn();

  beforeEach(() => {
    select.mockReset();
  });

  it("returns staff double-book conflicts from overlapping assignments", async () => {
    select.mockReturnValue({
      from: () => ({
        innerJoin: () => ({
          where: () => Promise.resolve([{ conflictingSessionId: "session-2" }]),
        }),
      }),
    });

    const conflicts = await findStaffDoubleBookConflicts({ select } as never, {
      tenantId: "tenant-1",
      startsAt: new Date("2026-06-26T17:00:00.000Z"),
      endsAt: new Date("2026-06-26T18:30:00.000Z"),
      staffUserIds: ["staff-1"],
      excludeSessionId: "session-1",
    });

    expect(conflicts).toEqual([
      {
        type: "staff_double_book",
        severity: "error",
        userId: "staff-1",
        conflictingSessionId: "session-2",
      },
    ]);
  });

  it("returns no conflicts when staff list is empty", async () => {
    const conflicts = await findStaffDoubleBookConflicts({ select } as never, {
      tenantId: "tenant-1",
      startsAt: new Date("2026-06-26T17:00:00.000Z"),
      endsAt: new Date("2026-06-26T18:30:00.000Z"),
      staffUserIds: [],
    });

    expect(conflicts).toEqual([]);
    expect(select).not.toHaveBeenCalled();
  });
});
