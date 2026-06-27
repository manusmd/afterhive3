import { beforeEach, describe, expect, it, vi } from "vitest";
import type { SessionContext } from "@afterhive/domain";
import { EndEnrollmentError, endEnrollment, validateEndEnrollmentInput } from "./end-enrollment";

const getDb = vi.hoisted(() => vi.fn());

vi.mock("@afterhive/db", () => ({
  getDb,
}));

const tenantId = "tenant-1";
const tenantSlug = "demo-club";
const enrollmentId = "enrollment-1";
const offerGroupId = "group-1";
const locationId = "loc-1";

const ownerSession: SessionContext = {
  userId: "owner-1",
  surface: "tenant_admin",
  tenantId,
  tenantSlug,
  roles: ["tenant_owner"],
};

type MockEnrollmentRow = {
  enrollmentId: string;
  offerGroupId: string;
  enrollmentStatus: string;
  locationId: string;
};

const selectResults = vi.hoisted(() => ({
  enrollment: null as MockEnrollmentRow | null,
  group: null as { capacity: number; enrolledCount: number; status: "open" | "full" } | null,
}));

const update = vi.hoisted(() => vi.fn());

function mockTransaction() {
  let innerJoinWhereCall = 0;
  let directWhereCall = 0;
  let updateCall = 0;

  return {
    select: () => ({
      from: () => ({
        innerJoin: () => ({
          innerJoin: () => ({
            where: () => {
              innerJoinWhereCall += 1;

              if (innerJoinWhereCall === 1) {
                return {
                  for: () => ({
                    limit: () =>
                      Promise.resolve(selectResults.enrollment ? [selectResults.enrollment] : []),
                  }),
                };
              }

              return {
                for: () => ({
                  limit: () => Promise.resolve([]),
                }),
              };
            },
          }),
        }),
        where: () => {
          directWhereCall += 1;

          return {
            for: () => ({
              limit: () => Promise.resolve(selectResults.group ? [selectResults.group] : []),
            }),
          };
        },
      }),
    }),
    update: () => ({
      set: () => ({
        where: () => {
          updateCall += 1;
          update();

          if (updateCall === 1) {
            return {
              returning: () =>
                Promise.resolve([
                  {
                    id: enrollmentId,
                    status: "ended",
                    endedAt: new Date("2026-06-26T12:00:00.000Z"),
                    endReason: "completed",
                  },
                ]),
            };
          }

          return Promise.resolve(undefined);
        },
      }),
    }),
  };
}

describe("validateEndEnrollmentInput", () => {
  it("accepts valid reasons", () => {
    expect(validateEndEnrollmentInput({ reason: "completed" })).toBeNull();
  });

  it("rejects invalid reasons", () => {
    expect(validateEndEnrollmentInput({ reason: "invalid" as never })).toBe("invalid_reason");
  });
});

describe("endEnrollment", () => {
  beforeEach(() => {
    getDb.mockReset();
    update.mockReset();
    selectResults.enrollment = {
      enrollmentId,
      offerGroupId,
      enrollmentStatus: "active",
      locationId,
    };
    selectResults.group = {
      capacity: 20,
      enrolledCount: 10,
      status: "open",
    };
    getDb.mockReturnValue({
      transaction: vi.fn(async (callback: (tx: unknown) => Promise<unknown>) =>
        callback(mockTransaction()),
      ),
    });
  });

  it("ends an active enrollment and keeps history", async () => {
    const result = await endEnrollment(ownerSession, tenantSlug, enrollmentId);

    expect(result).toEqual({
      enrollmentId,
      status: "ended",
      endedAt: "2026-06-26T12:00:00.000Z",
      endReason: "completed",
    });
    expect(update).toHaveBeenCalledTimes(2);
  });

  it("throws enrollment_not_found when missing", async () => {
    selectResults.enrollment = null;

    await expect(endEnrollment(ownerSession, tenantSlug, enrollmentId)).rejects.toMatchObject({
      code: "enrollment_not_found",
    });
  });

  it("throws invalid_status for non-active enrollments", async () => {
    selectResults.enrollment = {
      enrollmentId,
      offerGroupId,
      enrollmentStatus: "pending",
      locationId,
    };

    await expect(endEnrollment(ownerSession, tenantSlug, enrollmentId)).rejects.toMatchObject({
      code: "invalid_status",
    });
  });

  it("throws invalid_reason for unsupported reason values", async () => {
    await expect(
      endEnrollment(ownerSession, tenantSlug, enrollmentId, { reason: "invalid" as never }),
    ).rejects.toMatchObject({ code: "invalid_reason" });
  });
});
