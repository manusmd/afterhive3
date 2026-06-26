import { beforeEach, describe, expect, it, vi } from "vitest";
import type { SessionContext } from "@afterhive/domain";
import { MergePersonsError, mergePersons } from "./merge-persons";
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

function mockTransaction(options: {
  winner: MockPerson | null;
  loser: MockPerson | null;
  repointedLeadIds?: string[];
  deleteLoser?: boolean;
}) {
  const transaction = vi.fn(async (callback: (tx: unknown) => Promise<unknown>) => {
    const tx = {
      select: () => ({
        from: () => ({
          innerJoin: () => ({
            where: () => ({
              for: () => ({
                limit: () => {
                  let callCount = 0;
                  return Promise.resolve(
                    (() => {
                      callCount += 1;
                      if (callCount === 1) {
                        return options.winner ? [options.winner] : [];
                      }
                      return options.loser ? [options.loser] : [];
                    })(),
                  );
                },
              }),
            }),
          }),
        }),
      }),
      update: (table: unknown) => {
        const isLeadsUpdate = table !== undefined;
        return {
          set: () => ({
            where: () => ({
              returning: () =>
                Promise.resolve(
                  isLeadsUpdate
                    ? (options.repointedLeadIds ?? []).map((id) => ({ id }))
                    : options.deleteLoser === false
                      ? []
                      : [{ id: loserId }],
                ),
            }),
          }),
        };
      },
      insert: () => ({
        values: vi.fn(async () => undefined),
      }),
    };

    return callback(tx);
  });

  getDb.mockReturnValue({ transaction });
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
    mockTransaction({ winner: null, loser: null });

    await expect(
      mergePersons(ownerSession, tenantSlug, { winnerId, loserId }),
    ).rejects.toMatchObject({ code: "person_not_found" });
  });

  it("throws already_deleted when loser is soft-deleted", async () => {
    mockTransaction({
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
    });

    await expect(
      mergePersons(ownerSession, tenantSlug, { winnerId, loserId }),
    ).rejects.toMatchObject({ code: "already_deleted" });
  });

  it("repoints lead FKs, soft-deletes loser, and writes audit entry", async () => {
    const insertValues = vi.fn(async () => undefined);

    getDb.mockReturnValue({
      transaction: vi.fn(async (callback: (tx: unknown) => Promise<unknown>) => {
        let selectCount = 0;

        const tx = {
          select: () => ({
            from: () => ({
              innerJoin: () => ({
                where: () => ({
                  for: () => ({
                    limit: () => {
                      selectCount += 1;
                      if (selectCount === 1) {
                        return Promise.resolve([
                          {
                            id: winnerId,
                            firstName: "Anna",
                            lastName: "Nord",
                            deletedAt: null,
                          },
                        ]);
                      }
                      return Promise.resolve([
                        {
                          id: loserId,
                          firstName: "Anna",
                          lastName: "Alt",
                          deletedAt: null,
                        },
                      ]);
                    },
                  }),
                }),
              }),
            }),
          }),
          update: () => ({
            set: () => ({
              where: () => ({
                returning: () => Promise.resolve([{ id: "lead-1" }, { id: "lead-2" }]),
              }),
            }),
          }),
          insert: () => ({
            values: insertValues,
          }),
        };

        return callback(tx);
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
