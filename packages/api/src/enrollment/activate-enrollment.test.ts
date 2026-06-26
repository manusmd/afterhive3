import { beforeEach, describe, expect, it, vi } from "vitest";
import type { SessionContext } from "@afterhive/domain";
import { ActivateEnrollmentError, activateEnrollment } from "./activate-enrollment";

const tenantId = "tenant-1";
const tenantSlug = "demo-club";
const enrollmentId = "enrollment-1";
const offerGroupId = "group-1";

const getDb = vi.hoisted(() => vi.fn());

vi.mock("@afterhive/db", () => ({
  getDb,
}));

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
  enrolledAt: Date;
  consentStatus: string;
  dateOfBirth: string | null;
};

const defaultEnrolledAt = new Date("2026-06-26T12:00:00.000Z");

function mockTransaction(options: {
  row: MockEnrollmentRow | null;
  updated?: { id: string; status: string; activatedAt: Date } | null;
  offerGroup?: { capacity: number; enrolledCount: number } | null;
}) {
  let selectCall = 0;

  getDb.mockReturnValue({
    transaction: vi.fn(async (callback: (tx: unknown) => Promise<unknown>) => {
      const tx = {
        select: () => ({
          from: () => ({
            innerJoin: () => ({
              innerJoin: () => ({
                innerJoin: () => ({
                  where: () => {
                    selectCall += 1;

                    if (selectCall === 1) {
                      return {
                        for: () => ({
                          limit: () => Promise.resolve(options.row ? [options.row] : []),
                        }),
                      };
                    }

                    return {
                      limit: () =>
                        Promise.resolve(
                          options.offerGroup === undefined
                            ? [{ capacity: 20, enrolledCount: 5 }]
                            : options.offerGroup
                              ? [options.offerGroup]
                              : [],
                        ),
                    };
                  },
                }),
              }),
            }),
            where: () => ({
              limit: () =>
                Promise.resolve(
                  options.offerGroup === undefined
                    ? [{ capacity: 20, enrolledCount: 5 }]
                    : options.offerGroup
                      ? [options.offerGroup]
                      : [],
                ),
            }),
          }),
        }),
        update: () => ({
          set: () => ({
            where: () => ({
              returning: () =>
                Promise.resolve(
                  options.updated === undefined
                    ? [
                        {
                          id: enrollmentId,
                          status: "active",
                          activatedAt: new Date("2026-06-26T12:00:00.000Z"),
                        },
                      ]
                    : options.updated
                      ? [options.updated]
                      : [],
                ),
            }),
          }),
        }),
      };

      return callback(tx);
    }),
  });
}

describe("activateEnrollment", () => {
  beforeEach(() => {
    getDb.mockReset();
  });

  it("throws enrollment_not_found when missing", async () => {
    mockTransaction({ row: null });

    await expect(activateEnrollment(ownerSession, tenantSlug, enrollmentId)).rejects.toMatchObject({
      code: "enrollment_not_found",
    });
  });

  it("throws invalid_status when enrollment is not pending", async () => {
    mockTransaction({
      row: {
        enrollmentId,
        offerGroupId,
        enrollmentStatus: "active",
        enrolledAt: defaultEnrolledAt,
        consentStatus: "complete",
        dateOfBirth: "2015-01-01",
      },
    });

    await expect(activateEnrollment(ownerSession, tenantSlug, enrollmentId)).rejects.toMatchObject({
      code: "invalid_status",
    });
  });

  it("throws consent_required for minors with pending consent", async () => {
    mockTransaction({
      row: {
        enrollmentId,
        offerGroupId,
        enrollmentStatus: "pending",
        enrolledAt: defaultEnrolledAt,
        consentStatus: "pending",
        dateOfBirth: "2015-01-01",
      },
    });

    await expect(activateEnrollment(ownerSession, tenantSlug, enrollmentId)).rejects.toMatchObject({
      code: "consent_required",
    });
  });

  it("activates adult enrollments with pending consent", async () => {
    mockTransaction({
      row: {
        enrollmentId,
        offerGroupId,
        enrollmentStatus: "pending",
        enrolledAt: defaultEnrolledAt,
        consentStatus: "pending",
        dateOfBirth: "1990-01-01",
      },
    });

    const outcome = await activateEnrollment(ownerSession, tenantSlug, enrollmentId);

    expect(outcome.enrollmentId).toBe(enrollmentId);
    expect(outcome.status).toBe("active");
  });

  it("activates minor enrollments when consent is complete", async () => {
    mockTransaction({
      row: {
        enrollmentId,
        offerGroupId,
        enrollmentStatus: "pending",
        enrolledAt: defaultEnrolledAt,
        consentStatus: "complete",
        dateOfBirth: "2015-01-01",
      },
    });

    const outcome = await activateEnrollment(ownerSession, tenantSlug, enrollmentId);

    expect(outcome.status).toBe("active");
  });

  it("throws consent_required when enrolled as a minor before their 18th birthday", async () => {
    mockTransaction({
      row: {
        enrollmentId,
        offerGroupId,
        enrollmentStatus: "pending",
        enrolledAt: new Date("2026-06-26T12:00:00.000Z"),
        consentStatus: "pending",
        dateOfBirth: "2008-06-27",
      },
    });

    await expect(activateEnrollment(ownerSession, tenantSlug, enrollmentId)).rejects.toMatchObject({
      code: "consent_required",
    });
  });
});
