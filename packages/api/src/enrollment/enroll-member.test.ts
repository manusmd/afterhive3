import { beforeEach, describe, expect, it, vi } from "vitest";
import type { SessionContext } from "@afterhive/domain";
import { EnrollMemberError, enrollMember, validateEnrollMemberInput } from "./enroll-member";

const getDb = vi.hoisted(() => vi.fn());

vi.mock("@afterhive/db", () => ({
  getDb,
}));

const tenantId = "tenant-1";
const tenantSlug = "demo-club";
const memberProfileId = "member-1";
const offerGroupId = "group-1";
const locationId = "loc-1";

const ownerSession: SessionContext = {
  userId: "owner-1",
  surface: "tenant_admin",
  tenantId,
  tenantSlug,
  roles: ["tenant_owner"],
};

type MockGroup = {
  id: string;
  capacity: number;
  enrolledCount: number;
  waitlistEnabled: boolean;
  locationId: string;
  status: "open" | "full" | "closed" | "draft";
};

const selectResults = vi.hoisted(() => ({
  group: null as MockGroup | null,
  member: null as { id: string } | null,
  existingEnrollment: null as { id: string } | null,
  existingWaitlist: null as { id: string } | null,
  maxPosition: 0,
}));

const insert = vi.hoisted(() => vi.fn());

function mockTransaction() {
  let directSelectCall = 0;

  return {
    select: () => ({
      from: () => ({
        innerJoin: () => ({
          where: () => ({
            for: () => ({
              limit: () => Promise.resolve(selectResults.group ? [selectResults.group] : []),
            }),
          }),
        }),
        where: () => {
          directSelectCall += 1;

          if (directSelectCall === 4) {
            return Promise.resolve([{ maxPosition: selectResults.maxPosition }]);
          }

          return {
            limit: () => {
              if (directSelectCall === 1) {
                return Promise.resolve(selectResults.member ? [selectResults.member] : []);
              }

              if (directSelectCall === 2) {
                return Promise.resolve(
                  selectResults.existingEnrollment ? [selectResults.existingEnrollment] : [],
                );
              }

              return Promise.resolve(
                selectResults.existingWaitlist ? [selectResults.existingWaitlist] : [],
              );
            },
          };
        },
      }),
    }),
    insert: () => ({
      values: () => ({
        returning: insert,
      }),
    }),
  };
}

describe("validateEnrollMemberInput", () => {
  it("accepts member and offer group ids", () => {
    expect(
      validateEnrollMemberInput({
        memberProfileId,
        offerGroupId,
      }),
    ).toBeNull();
  });

  it("rejects missing fields", () => {
    expect(validateEnrollMemberInput({ memberProfileId: "", offerGroupId })).toBe("missing_fields");
  });
});

describe("enrollMember", () => {
  beforeEach(() => {
    getDb.mockReset();
    insert.mockReset();
    selectResults.group = {
      id: offerGroupId,
      capacity: 20,
      enrolledCount: 5,
      waitlistEnabled: true,
      locationId,
      status: "open",
    };
    selectResults.member = { id: memberProfileId };
    selectResults.existingEnrollment = null;
    selectResults.existingWaitlist = null;
    selectResults.maxPosition = 2;
    getDb.mockReturnValue({
      transaction: vi.fn(async (callback: (tx: unknown) => Promise<unknown>) =>
        callback(mockTransaction()),
      ),
    });
  });

  it("creates a pending enrollment when capacity is available", async () => {
    insert.mockResolvedValueOnce([{ id: "enrollment-1" }]);

    const result = await enrollMember(ownerSession, tenantSlug, {
      memberProfileId,
      offerGroupId,
    });

    expect(result).toEqual({
      outcome: "enrolled",
      enrollmentId: "enrollment-1",
      status: "pending",
    });
  });

  it("creates a waitlist entry when the group is full and waitlist is enabled", async () => {
    selectResults.group = {
      id: offerGroupId,
      capacity: 20,
      enrolledCount: 20,
      waitlistEnabled: true,
      locationId,
      status: "full",
    };
    insert.mockResolvedValueOnce([{ id: "waitlist-1", position: 3 }]);

    const result = await enrollMember(ownerSession, tenantSlug, {
      memberProfileId,
      offerGroupId,
    });

    expect(result).toEqual({
      outcome: "waitlisted",
      waitlistEntryId: "waitlist-1",
      position: 3,
      status: "waiting",
    });
  });

  it("throws group_full when the group is full without waitlist", async () => {
    selectResults.group = {
      id: offerGroupId,
      capacity: 20,
      enrolledCount: 20,
      waitlistEnabled: false,
      locationId,
      status: "full",
    };

    await expect(
      enrollMember(ownerSession, tenantSlug, { memberProfileId, offerGroupId }),
    ).rejects.toMatchObject({ code: "group_full" });
  });

  it("throws already_enrolled for duplicate active enrollment", async () => {
    selectResults.existingEnrollment = { id: "existing-enrollment" };

    await expect(
      enrollMember(ownerSession, tenantSlug, { memberProfileId, offerGroupId }),
    ).rejects.toBeInstanceOf(EnrollMemberError);
  });
});
