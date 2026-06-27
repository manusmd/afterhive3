import { beforeEach, describe, expect, it, vi } from "vitest";
import type { SessionContext } from "@afterhive/domain";
import {
  AssignSessionStaffError,
  assignSessionStaff,
  validateAssignSessionStaffInput,
} from "./assign-session-staff";

const validateSession = vi.hoisted(() => vi.fn());

vi.mock("./validate-session", () => ({
  validateSession,
}));

const getDb = vi.hoisted(() => vi.fn());

vi.mock("@afterhive/db", () => ({
  getDb,
}));

const tenantId = "tenant-1";
const tenantSlug = "demo-club";
const sessionId = "session-1";
const userId = "staff-1";
const locationId = "loc-1";

const ownerSession: SessionContext = {
  userId: "owner-1",
  surface: "tenant_admin",
  tenantId,
  tenantSlug,
  roles: ["tenant_owner"],
};

const selectResults = vi.hoisted(() => ({
  session: null as {
    sessionId: string;
    locationId: string;
    startsAt: Date;
    endsAt: Date;
    status: string;
  } | null,
  staffMember: null as { userId: string } | null,
  existingAssignment: null as { id: string } | null,
}));

const insert = vi.hoisted(() => vi.fn());

function mockTransaction() {
  let fromCall = 0;

  return {
    select: () => ({
      from: () => {
        fromCall += 1;

        if (fromCall === 3) {
          return {
            where: () => ({
              limit: () =>
                Promise.resolve(
                  selectResults.existingAssignment ? [selectResults.existingAssignment] : [],
                ),
            }),
          };
        }

        return {
          innerJoin: () => ({
            where: () => {
              if (fromCall === 1) {
                return {
                  for: () => ({
                    limit: () =>
                      Promise.resolve(selectResults.session ? [selectResults.session] : []),
                  }),
                };
              }

              return {
                limit: () =>
                  Promise.resolve(selectResults.staffMember ? [selectResults.staffMember] : []),
              };
            },
          }),
        };
      },
    }),
    insert: () => ({
      values: () => ({
        returning: insert,
      }),
    }),
  };
}

describe("validateAssignSessionStaffInput", () => {
  it("accepts user id", () => {
    expect(validateAssignSessionStaffInput({ userId })).toBeNull();
  });

  it("rejects empty user id", () => {
    expect(validateAssignSessionStaffInput({ userId: "" })).toBe("missing_fields");
  });
});

describe("assignSessionStaff", () => {
  beforeEach(() => {
    getDb.mockReset();
    validateSession.mockReset();
    insert.mockReset();
    selectResults.session = {
      sessionId,
      locationId,
      startsAt: new Date("2026-06-26T17:00:00.000Z"),
      endsAt: new Date("2026-06-26T18:30:00.000Z"),
      status: "scheduled",
    };
    selectResults.staffMember = { userId };
    selectResults.existingAssignment = null;
    validateSession.mockResolvedValue([]);
    insert.mockResolvedValue([
      { id: "assignment-1", sessionId, userId, role: "lead" },
    ]);
    getDb.mockReturnValue({
      transaction: vi.fn(async (callback: (tx: unknown) => Promise<unknown>) =>
        callback(mockTransaction()),
      ),
    });
  });

  it("assigns staff when there are no conflicts", async () => {
    const result = await assignSessionStaff(ownerSession, tenantSlug, sessionId, { userId });

    expect(result).toEqual({
      assignmentId: "assignment-1",
      sessionId,
      userId,
      role: "lead",
    });
    expect(validateSession).toHaveBeenCalled();
  });

  it("throws staff_double_book when validation finds a conflict", async () => {
    validateSession.mockResolvedValueOnce([
      {
        type: "staff_double_book",
        severity: "error",
        userId,
        conflictingSessionId: "session-2",
      },
    ]);

    await expect(
      assignSessionStaff(ownerSession, tenantSlug, sessionId, { userId }),
    ).rejects.toMatchObject({ code: "staff_double_book" });
  });

  it("throws session_not_found when missing", async () => {
    selectResults.session = null;

    await expect(
      assignSessionStaff(ownerSession, tenantSlug, sessionId, { userId }),
    ).rejects.toMatchObject({ code: "session_not_found" });
  });

  it("throws already_assigned for duplicate assignment", async () => {
    selectResults.existingAssignment = { id: "existing-assignment" };

    await expect(
      assignSessionStaff(ownerSession, tenantSlug, sessionId, { userId }),
    ).rejects.toBeInstanceOf(AssignSessionStaffError);
  });
});
