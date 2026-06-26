import { beforeEach, describe, expect, it, vi } from "vitest";
import type { SessionContext } from "@afterhive/domain";
import {
  collectPersonExportCategories,
  ExportPersonError,
  exportPerson,
} from "./export-person";

const tenantId = "tenant-1";
const tenantSlug = "demo-club";
const personId = "person-1";
const locationNorth = "loc-north";
const locationSouth = "loc-south";

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

const officeSession: SessionContext = {
  userId: "office-1",
  surface: "tenant_admin",
  tenantId,
  tenantSlug,
  roles: ["tenant_office"],
  locationIds: [locationNorth],
  roleAssignments: [{ role: "tenant_office", locationIds: [locationNorth] }],
};

const mixedFinanceOfficeSession: SessionContext = {
  userId: "mixed-1",
  surface: "tenant_admin",
  tenantId,
  tenantSlug,
  roles: ["tenant_finance", "tenant_office"],
  locationIds: undefined,
  roleAssignments: [
    { role: "tenant_finance", locationIds: null },
    { role: "tenant_office", locationIds: [locationNorth] },
  ],
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

function mockCollectCategoriesDb(exportLocationIds?: string[]) {
  const allLeads = [
    {
      id: "lead-north",
      firstName: "Leo",
      lastName: "Muster",
      status: "converted",
      source: "web",
      locationId: locationNorth,
      convertedAt: new Date("2024-02-01"),
      createdAt: new Date("2024-01-15"),
    },
    {
      id: "lead-south",
      firstName: "Leo",
      lastName: "Muster",
      status: "converted",
      source: "referral",
      locationId: locationSouth,
      convertedAt: new Date("2024-03-01"),
      createdAt: new Date("2024-02-15"),
    },
  ];

  let selectCall = 0;

  getDb.mockReturnValue({
    select: () => {
      selectCall += 1;
      const call = selectCall;

      return {
        from: () => ({
          where: () => {
            if (call === 1) {
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

            if (call === 2) {
              return {
                limit: () => Promise.resolve([]),
              };
            }

            if (call === 5) {
              const scopedLeads =
                exportLocationIds && exportLocationIds.length > 0
                  ? allLeads.filter((lead) => exportLocationIds.includes(lead.locationId))
                  : allLeads;
              return Promise.resolve(scopedLeads);
            }

            return Promise.resolve([]);
          },
        }),
      };
    },
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

  it("uses export-capable role scope for mixed finance and office sessions", async () => {
    mockCollectCategoriesDb([locationNorth]);

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
                  limit: () => Promise.resolve([{ id: "lead-north" }]),
                };
              }

              if (call === 3) {
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

              if (call === 4) {
                return {
                  limit: () => Promise.resolve([]),
                };
              }

              if (call === 5 || call === 6) {
                return Promise.resolve([]);
              }

              if (call === 7) {
                return Promise.resolve([
                  {
                    id: "lead-north",
                    firstName: "Leo",
                    lastName: "Muster",
                    status: "converted",
                    source: "web",
                    locationId: locationNorth,
                    convertedAt: new Date("2024-02-01"),
                    createdAt: new Date("2024-01-15"),
                  },
                ]);
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

    const result = await exportPerson(mixedFinanceOfficeSession, tenantSlug, personId);

    expect(result.categories.leads).toHaveLength(1);
    expect(result.categories.leads).toEqual([
      expect.objectContaining({ id: "lead-north", locationId: locationNorth }),
    ]);
  });
});

describe("collectPersonExportCategories", () => {
  beforeEach(() => {
    getDb.mockReset();
  });

  it("filters converted leads to export location scope", async () => {
    mockCollectCategoriesDb([locationNorth]);

    const scoped = await collectPersonExportCategories(tenantId, personId, [locationNorth]);

    const scopedLeads = scoped.leads as Array<{ id: string; locationId: string }>;

    expect(scopedLeads).toHaveLength(1);
    expect(scopedLeads[0]).toMatchObject({ id: "lead-north", locationId: locationNorth });

    getDb.mockReset();
    mockCollectCategoriesDb(undefined);

    const unrestricted = await collectPersonExportCategories(tenantId, personId, undefined);
    const unrestrictedLeads = unrestricted.leads as Array<{ locationId: string }>;

    expect(unrestrictedLeads).toHaveLength(2);
    expect(unrestrictedLeads.map((lead) => lead.locationId).sort()).toEqual([
      locationNorth,
      locationSouth,
    ]);
  });

  it("includes consent records granted by the exported guardian", async () => {
    const guardianPersonId = "guardian-person";
    const minorPersonId = "minor-person";
    const grantedForMinor = {
      id: "consent-1",
      personId: minorPersonId,
      type: "parental",
      granted: true,
      grantedAt: new Date("2024-04-01"),
      method: "portal",
      guardianPersonId: guardianPersonId,
    };

    let selectCall = 0;

    getDb.mockReturnValue({
      select: () => {
        selectCall += 1;
        const call = selectCall;

        return {
          from: () => ({
            where: () => {
              if (call === 1) {
                return {
                  limit: () =>
                    Promise.resolve([
                      {
                        id: guardianPersonId,
                        firstName: "Maria",
                        lastName: "Muster",
                        dateOfBirth: "1985-01-01",
                        createdAt: new Date("2024-01-01"),
                      },
                    ]),
                };
              }

              if (call === 2) {
                return {
                  limit: () => Promise.resolve([]),
                };
              }

              if (call === 3) {
                return Promise.resolve([grantedForMinor]);
              }

              if (call === 4 || call === 5) {
                return Promise.resolve([]);
              }

              return Promise.resolve([]);
            },
          }),
        };
      },
    });

    const result = await collectPersonExportCategories(tenantId, guardianPersonId, undefined);
    const consentEntries = result.consent as Array<{
      id: string;
      personId: string;
      guardianPersonId: string;
    }>;

    expect(consentEntries).toHaveLength(1);
    expect(consentEntries[0]).toMatchObject({
      id: "consent-1",
      personId: minorPersonId,
      guardianPersonId: guardianPersonId,
    });
  });
});
