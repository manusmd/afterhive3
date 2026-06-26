import { beforeEach, describe, expect, it, vi } from "vitest";
import type { SessionContext } from "@afterhive/domain";
import { AnonymizePersonError, anonymizePerson } from "./anonymize-person";

const tenantId = "tenant-1";
const tenantSlug = "demo-club";
const personId = "person-1";
const memberProfileId = "member-1";
const locationNorth = "loc-north";

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
  locationIds: undefined,
  roleAssignments: [{ role: "tenant_owner", locationIds: null }],
};

const scopedAdminSession: SessionContext = {
  userId: "admin-1",
  surface: "tenant_admin",
  tenantId,
  tenantSlug,
  roles: ["tenant_admin"],
  locationIds: [locationNorth],
  roleAssignments: [{ role: "tenant_admin", locationIds: [locationNorth] }],
};

type MockPerson = {
  id: string;
  deletedAt: Date | null;
};

function createTransactionMock(options: {
  person: MockPerson | null;
  memberProfileId?: string | null;
  leadIds?: string[];
  deletePerson?: boolean;
}) {
  let selectCount = 0;
  let updateCount = 0;

  return {
    select: () => ({
      from: () => ({
        innerJoin: () => ({
          where: () => ({
            for: () => ({
              limit: () => {
                selectCount += 1;
                if (selectCount === 1) {
                  return Promise.resolve(options.person ? [options.person] : []);
                }
                return Promise.resolve([]);
              },
            }),
          }),
        }),
        where: () => ({
          limit: () => {
            selectCount += 1;
            if (selectCount === 2) {
              return Promise.resolve(
                options.memberProfileId ? [{ id: options.memberProfileId }] : [],
              );
            }
            return Promise.resolve([]);
          },
        }),
      }),
    }),
    update: () => ({
      set: () => ({
        where: () => ({
          returning: () => {
            updateCount += 1;
            if (updateCount === 1) {
              return Promise.resolve((options.leadIds ?? []).map((id) => ({ id })));
            }
            if (options.deletePerson === false) {
              return Promise.resolve([]);
            }
            return Promise.resolve([{ id: personId }]);
          },
        }),
      }),
    }),
    insert: () => ({
      values: vi.fn(async () => undefined),
    }),
  };
}

describe("anonymizePerson", () => {
  beforeEach(() => {
    getDb.mockReset();
  });

  it("throws person_not_found when person is missing", async () => {
    getDb.mockReturnValue({
      transaction: vi.fn(async (callback: (tx: unknown) => Promise<unknown>) =>
        callback(createTransactionMock({ person: null })),
      ),
    });

    await expect(anonymizePerson(ownerSession, tenantSlug, personId)).rejects.toMatchObject({
      code: "person_not_found",
    });
  });

  it("throws already_anonymized when person is deleted", async () => {
    getDb.mockReturnValue({
      transaction: vi.fn(async (callback: (tx: unknown) => Promise<unknown>) =>
        callback(
          createTransactionMock({
            person: {
              id: personId,
              deletedAt: new Date("2024-01-01"),
            },
          }),
        ),
      ),
    });

    await expect(anonymizePerson(ownerSession, tenantSlug, personId)).rejects.toMatchObject({
      code: "already_anonymized",
    });
  });

  it("anonymizes person PII, clears portal link, and retains member profile", async () => {
    const values = vi.fn(async () => undefined);

    getDb.mockReturnValue({
      transaction: vi.fn(async (callback: (tx: unknown) => Promise<unknown>) => {
        const tx = createTransactionMock({
          person: {
            id: personId,
            deletedAt: null,
          },
          memberProfileId,
          leadIds: ["lead-1", "lead-2"],
        });
        tx.insert = () => ({ values });
        return callback(tx);
      }),
    });

    const result = await anonymizePerson(ownerSession, tenantSlug, personId);

    expect(result).toEqual({
      personId,
      anonymizedAt: expect.any(String),
      anonymizedLeadIds: ["lead-1", "lead-2"],
    });
    expect(values).toHaveBeenCalledWith(
      expect.objectContaining({
        action: "person.anonymize",
        entityId: personId,
        before: {
          personId,
          redactedFields: ["firstName", "lastName", "dateOfBirth", "userId"],
        },
        after: expect.objectContaining({
          memberProfileRetained: memberProfileId,
          anonymizedLeadIds: ["lead-1", "lead-2"],
        }),
      }),
    );
  });

  it("throws location_forbidden for scoped admin without lead in scope", async () => {
    getDb.mockReturnValue({
      select: () => ({
        from: () => ({
          where: () => ({
            limit: () => Promise.resolve([]),
          }),
        }),
      }),
    });

    await expect(anonymizePerson(scopedAdminSession, tenantSlug, personId)).rejects.toMatchObject({
      code: "location_forbidden",
    });
  });

  it("throws already_anonymized when update returns no row", async () => {
    getDb.mockReturnValue({
      transaction: vi.fn(async (callback: (tx: unknown) => Promise<unknown>) =>
        callback(
          createTransactionMock({
            person: {
              id: personId,
              deletedAt: null,
            },
            leadIds: [],
            deletePerson: false,
          }),
        ),
      ),
    });

    await expect(anonymizePerson(ownerSession, tenantSlug, personId)).rejects.toBeInstanceOf(
      AnonymizePersonError,
    );
  });
});
