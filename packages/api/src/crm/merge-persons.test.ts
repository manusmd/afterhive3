import { beforeEach, describe, expect, it, vi } from "vitest";
import type { SessionContext } from "@afterhive/domain";
import { mergePersons } from "./merge-persons";

const tenantId = "tenant-1";
const tenantSlug = "demo-club";
const winnerId = "person-winner";
const loserId = "person-loser";

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
};

type MockPerson = {
  id: string;
  firstName: string;
  lastName: string;
  deletedAt: Date | null;
};

function createTransactionMock(options: {
  winner: MockPerson | null;
  loser: MockPerson | null;
  repointedLeadIds?: string[];
  deleteLoser?: boolean;
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
                  return Promise.resolve(options.winner ? [options.winner] : []);
                }
                return Promise.resolve(options.loser ? [options.loser] : []);
              },
            }),
          }),
        }),
      }),
    }),
    update: () => ({
      set: () => ({
        where: () => ({
          returning: () => {
            updateCount += 1;
            if (updateCount === 1) {
              return Promise.resolve(
                (options.repointedLeadIds ?? []).map((id) => ({ id })),
              );
            }
            if (options.deleteLoser === false) {
              return Promise.resolve([]);
            }
            return Promise.resolve([{ id: loserId }]);
          },
        }),
      }),
    }),
    insert: () => ({
      values: vi.fn(async () => undefined),
    }),
  };
}

describe("mergePersons", () => {
  beforeEach(() => {
    getDb.mockReset();
  });

  it("throws same_person when ids match", async () => {
    await expect(
      mergePersons(ownerSession, tenantSlug, { winnerId, loserId: winnerId }),
    ).rejects.toMatchObject({ code: "same_person" });

    expect(getDb).not.toHaveBeenCalled();
  });

  it("throws person_not_found when a person is missing", async () => {
    getDb.mockReturnValue({
      transaction: vi.fn(async (callback: (tx: unknown) => Promise<unknown>) =>
        callback(createTransactionMock({ winner: null, loser: null })),
      ),
    });

    await expect(
      mergePersons(ownerSession, tenantSlug, { winnerId, loserId }),
    ).rejects.toMatchObject({ code: "person_not_found" });
  });

  it("throws already_deleted when loser is soft-deleted", async () => {
    getDb.mockReturnValue({
      transaction: vi.fn(async (callback: (tx: unknown) => Promise<unknown>) =>
        callback(
          createTransactionMock({
            winner: {
              id: winnerId,
              firstName: "Anna",
              lastName: "Nord",
              deletedAt: null,
            },
            loser: {
              id: loserId,
              firstName: "Anna",
              lastName: "Alt",
              deletedAt: new Date("2026-06-26T12:00:00.000Z"),
            },
          }),
        ),
      ),
    });

    await expect(
      mergePersons(ownerSession, tenantSlug, { winnerId, loserId }),
    ).rejects.toMatchObject({ code: "already_deleted" });
  });

  it("throws already_deleted when loser delete update matches no row", async () => {
    getDb.mockReturnValue({
      transaction: vi.fn(async (callback: (tx: unknown) => Promise<unknown>) =>
        callback(
          createTransactionMock({
            winner: {
              id: winnerId,
              firstName: "Anna",
              lastName: "Nord",
              deletedAt: null,
            },
            loser: {
              id: loserId,
              firstName: "Anna",
              lastName: "Alt",
              deletedAt: null,
            },
            deleteLoser: false,
          }),
        ),
      ),
    });

    await expect(
      mergePersons(ownerSession, tenantSlug, { winnerId, loserId }),
    ).rejects.toMatchObject({ code: "already_deleted" });
  });

  it("repoints lead FKs, soft-deletes loser, and writes audit entry", async () => {
    const insertValues = vi.fn(async () => undefined);
    const tx = createTransactionMock({
      winner: {
        id: winnerId,
        firstName: "Anna",
        lastName: "Nord",
        deletedAt: null,
      },
      loser: {
        id: loserId,
        firstName: "Anna",
        lastName: "Alt",
        deletedAt: null,
      },
      repointedLeadIds: ["lead-1", "lead-2"],
    });

    getDb.mockReturnValue({
      transaction: vi.fn(async (callback: (txArg: unknown) => Promise<unknown>) => {
        return callback({
          ...tx,
          insert: () => ({
            values: insertValues,
          }),
        });
      }),
    });

    const outcome = await mergePersons(ownerSession, tenantSlug, { winnerId, loserId });

    expect(outcome.personId).toBe(winnerId);
    expect(outcome.repointedLeadIds).toEqual(["lead-1", "lead-2"]);
    expect(insertValues).toHaveBeenCalledWith(
      expect.objectContaining({
        tenantId,
        actorUserId: ownerSession.userId,
        action: "person.merge",
        entityType: "person",
        entityId: winnerId,
        before: expect.objectContaining({ loserId }),
        after: expect.objectContaining({ repointedLeadIds: ["lead-1", "lead-2"] }),
      }),
    );
  });
});
