import { beforeEach, describe, expect, it, vi } from "vitest";
import type { SessionContext } from "@afterhive/domain";
import {
  RecordBulkAttendanceError,
  recordBulkAttendance,
  validateRecordBulkAttendanceInput,
} from "./record-bulk-attendance";

const getDb = vi.hoisted(() => vi.fn());
const canRecordAttendanceForSession = vi.hoisted(() => vi.fn(() => Promise.resolve(true)));
const loadEligibleMemberIdsForSession = vi.hoisted(() =>
  vi.fn(() => Promise.resolve(new Set(["member-1"]))),
);

vi.mock("@afterhive/db", () => ({
  getDb,
}));

vi.mock("./list-session-attendance", () => ({
  canRecordAttendanceForSession,
  loadEligibleMemberIdsForSession,
}));

const tenantId = "tenant-1";
const tenantSlug = "demo-club";
const sessionId = "session-1";
const memberProfileId = "member-1";

const ownerSession: SessionContext = {
  userId: "owner-1",
  surface: "tenant_admin",
  tenantId,
  tenantSlug,
  roles: ["tenant_owner"],
};

const selectResults = vi.hoisted(() => ({
  session: {
    sessionId: "session-1",
    offerGroupId: "group-1",
    offerId: "offer-1",
  } as { sessionId: string; offerGroupId: string; offerId: string } | null,
}));

const onConflictDoUpdate = vi.hoisted(() => vi.fn(() => Promise.resolve()));

function mockTransaction() {
  return {
    select: () => ({
      from: () => ({
        innerJoin: () => ({
          innerJoin: () => ({
            where: () => ({
              limit: () => Promise.resolve(selectResults.session ? [selectResults.session] : []),
            }),
          }),
        }),
      }),
    }),
    insert: () => ({
      values: () => ({
        onConflictDoUpdate,
      }),
    }),
  };
}

describe("validateRecordBulkAttendanceInput", () => {
  it("rejects duplicate members", () => {
    expect(
      validateRecordBulkAttendanceInput({
        sessionId,
        records: [
          { memberProfileId: "a", status: "present" },
          { memberProfileId: "a", status: "absent" },
        ],
      }),
    ).toBe("duplicate_member");
  });

  it("rejects invalid status", () => {
    expect(
      validateRecordBulkAttendanceInput({
        sessionId,
        records: [{ memberProfileId, status: "invalid" as "present" }],
      }),
    ).toBe("invalid_status");
  });
});

describe("recordBulkAttendance", () => {
  beforeEach(() => {
    selectResults.session = {
      sessionId,
      offerGroupId: "group-1",
      offerId: "offer-1",
    };
    canRecordAttendanceForSession.mockResolvedValue(true);
    loadEligibleMemberIdsForSession.mockResolvedValue(new Set([memberProfileId]));
    onConflictDoUpdate.mockClear();
    getDb.mockReturnValue({
      transaction: (fn: (tx: ReturnType<typeof mockTransaction>) => Promise<void>) =>
        fn(mockTransaction()),
    });
  });

  it("upserts attendance records", async () => {
    await recordBulkAttendance(ownerSession, tenantSlug, {
      sessionId,
      records: [{ memberProfileId, status: "present" }],
    });

    expect(onConflictDoUpdate).toHaveBeenCalledTimes(1);
  });

  it("throws when session is missing", async () => {
    selectResults.session = null;

    await expect(
      recordBulkAttendance(ownerSession, tenantSlug, {
        sessionId,
        records: [{ memberProfileId, status: "present" }],
      }),
    ).rejects.toMatchObject({ code: "session_not_found" });
  });

  it("throws when member is not eligible", async () => {
    loadEligibleMemberIdsForSession.mockResolvedValueOnce(new Set());

    await expect(
      recordBulkAttendance(ownerSession, tenantSlug, {
        sessionId,
        records: [{ memberProfileId, status: "present" }],
      }),
    ).rejects.toMatchObject({ code: "member_not_eligible" });
  });

  it("throws when forbidden for session", async () => {
    canRecordAttendanceForSession.mockResolvedValueOnce(false);

    await expect(
      recordBulkAttendance(ownerSession, tenantSlug, {
        sessionId,
        records: [{ memberProfileId, status: "present" }],
      }),
    ).rejects.toMatchObject({ code: "forbidden" satisfies RecordBulkAttendanceError["code"] });
  });
});
