import { beforeEach, describe, expect, it, vi } from "vitest";
import type { SessionContext } from "@afterhive/domain";
import { ExportPersonError, exportPerson } from "./export-person";

const tenantId = "tenant-1";
const tenantSlug = "demo-club";
const personId = "person-1";
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
};

const officeSession: SessionContext = {
  userId: "office-1",
  surface: "tenant_admin",
  tenantId,
  tenantSlug,
  roles: ["tenant_office"],
  locationIds: [locationNorth],
};

function mockExportDb(options: {
  personFound?: boolean;
  scopedLeadFound?: boolean;
  profileFound?: boolean;
}) {
  let selectCount = 0;

  getDb.mockReturnValue({
    select: () => ({
      from: () => ({
        innerJoin: () => ({
          where: () => ({
            limit: () => {
              selectCount += 1;
              if (selectCount === 1) {
                return Promise.resolve(
                  options.personFound === false
                    ? []
                    : [{ id: personId, firstName: "Leo", lastName: "Muster" }],
                );
              }
              return Promise.resolve([]);
            },
          }),
        }),
        where: () => ({
          limit: () => {
            selectCount += 1;
            if (selectCount === 2) {
              return Promise.resolve(
                options.scopedLeadFound === false
                  ? []
                  : [{ id: "lead-1" }],
              );
            }
            if (selectCount === 3) {
              return Promise.resolve(
                options.profileFound === false
                  ? []
                  : [
                      {
                        id: personId,
                        firstName: "Leo",
                        lastName: "Muster",
                        dateOfBirth: "2015-01-01",
                        createdAt: new Date("2024-01-01"),
                      },
                    ],
              );
            }
            return Promise.resolve([]);
          },
        }),
      }),
    }),
    insert: () => ({
      values: vi.fn(async () => undefined),
    }),
  });
}

describe("exportPerson", () => {
  beforeEach(() => {
    getDb.mockReset();
  });

  it("throws person_not_found when person is missing", async () => {
    mockExportDb({ personFound: false });

    await expect(exportPerson(ownerSession, tenantSlug, personId)).rejects.toMatchObject({
      code: "person_not_found",
    });
  });

  it("throws location_forbidden for scoped user without lead in scope", async () => {
    mockExportDb({ scopedLeadFound: false });

    await expect(exportPerson(officeSession, tenantSlug, personId)).rejects.toMatchObject({
      code: "location_forbidden",
    });
  });

  it("returns zip with category file names for owner", async () => {
    let selectCall = 0;

    getDb.mockReturnValue({
      select: () => {
        selectCall += 1;
        const call = selectCall;

        return {
          from: () => ({
            innerJoin: () => ({
              where: () => ({
                limit: () =>
                  Promise.resolve([
                    { id: personId, firstName: "Leo", lastName: "Muster" },
                  ]),
              }),
            }),
            where: () => {
              if (call === 2) {
                return {
                  limit: () =>
                    Promise.resolve([
                      {
                        id: personId,
                        firstName: "Leo",
                        lastName: "Muster",
                        dateOfBirth: "2015-01-01",
                        createdAt: new Date("2024-01-01"),
                      },
                    ]),
                };
              }

              if (call === 3) {
                return {
                  limit: () => Promise.resolve([]),
                };
              }

              return Promise.resolve([]);
            },
          }),
        };
      },
      insert: () => ({
        values: vi.fn(async () => undefined),
      }),
    });

    const result = await exportPerson(ownerSession, tenantSlug, personId);

    expect(result.fileName).toBe(`person-export-${personId}.zip`);
    expect(Object.keys(result.categories)).toEqual([
      "profile",
      "member",
      "consent",
      "relationships",
      "leads",
    ]);
    expect(result.zip.byteLength).toBeGreaterThan(0);
  });

  it("throws person_not_found from collect when profile deleted", async () => {
    let selectCount = 0;

    getDb.mockReturnValue({
      select: () => ({
        from: () => ({
          innerJoin: () => ({
            where: () => ({
              limit: () => {
                selectCount += 1;
                if (selectCount === 1) {
                  return Promise.resolve([
                    { id: personId, firstName: "Leo", lastName: "Muster" },
                  ]);
                }
                return Promise.resolve([]);
              },
            }),
          }),
          where: () => ({
            limit: () => {
              selectCount += 1;
              if (selectCount === 2) {
                return Promise.resolve([]);
              }
              return Promise.resolve([]);
            },
          }),
        }),
      }),
      insert: () => ({
        values: vi.fn(async () => undefined),
      }),
    });

    await expect(exportPerson(ownerSession, tenantSlug, personId)).rejects.toBeInstanceOf(
      ExportPersonError,
    );
  });
});
