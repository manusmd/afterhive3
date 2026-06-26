import { beforeEach, describe, expect, it, vi } from "vitest";
import type { SessionContext } from "@afterhive/domain";
import { ActivateEnrollmentError, activateEnrollment } from "./activate-enrollment";

const tenantId = "tenant-1";
const tenantSlug = "demo-club";
const enrollmentId = "enrollment-1";

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
  enrollmentStatus: string;
  consentStatus: string;
  dateOfBirth: string | null;
};

function mockTransaction(options: {
  row: MockEnrollmentRow | null;
  updated?: { id: string; status: string; activatedAt: Date } | null;
}) {
  getDb.mockReturnValue({
    transaction: vi.fn(async (callback: (tx: unknown) => Promise<unknown>) => {
      const tx = {
        select: () => ({
          from: () => ({
            innerJoin: () => ({
              innerJoin: () => ({
                innerJoin: () => ({
                  where: () => ({
                    for: () => ({
                      limit: () => Promise.resolve(options.row ? [options.row] : []),
                    }),
                  }),
                }),
              }),
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
        enrollmentStatus: "active",
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
        enrollmentStatus: "pending",
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
        enrollmentStatus: "pending",
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
        enrollmentStatus: "pending",
        consentStatus: "complete",
        dateOfBirth: "2015-01-01",
      },
    });

    const outcome = await activateEnrollment(ownerSession, tenantSlug, enrollmentId);

    expect(outcome.status).toBe("active");
  });
});
