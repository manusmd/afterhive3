import { beforeEach, describe, expect, it, vi } from "vitest";
import type { PortalSessionContext } from "../auth/get-portal-session";
import { GrantConsentError, grantConsent } from "./grant-consent";

const tenantId = "tenant-1";
const tenantSlug = "demo-club";
const guardianPersonId = "guardian-person";
const minorPersonId = "minor-person";

const getDb = vi.hoisted(() => vi.fn());

vi.mock("@afterhive/db", () => ({
  getDb,
}));

const guardianSession: PortalSessionContext = {
  userId: "guardian-user",
  surface: "portal",
  tenantId,
  tenantSlug,
  roles: ["portal_parent"],
  personId: guardianPersonId,
};

function mockTransaction(options: {
  minorFound: boolean;
  guardianLinkFound: boolean;
  existingConsent?: boolean;
}) {
  getDb.mockReturnValue({
    transaction: vi.fn(async (callback: (tx: unknown) => Promise<unknown>) => {
      const tx = {
        select: () => ({
          from: () => ({
            innerJoin: () => ({
              where: () => ({
                limit: () => Promise.resolve(options.minorFound ? [{ id: minorPersonId }] : []),
              }),
            }),
            where: () => ({
              limit: () => {
                let callCount = 0;
                return Promise.resolve(
                  (() => {
                    callCount += 1;
                    if (callCount === 1) {
                      return options.guardianLinkFound ? [{ id: "rel-1" }] : [];
                    }
                    return options.existingConsent ? [{ id: "consent-1" }] : [];
                  })(),
                );
              },
            }),
          }),
        }),
        insert: () => ({
          values: () => ({
            returning: () => Promise.resolve([{ id: "consent-new" }]),
          }),
        }),
        update: () => ({
          set: () => ({
            where: () => Promise.resolve(undefined),
          }),
        }),
      };

      return callback(tx);
    }),
  });
}

describe("grantConsent", () => {
  beforeEach(() => {
    getDb.mockReset();
  });

  it("throws person_not_found for unknown minor", async () => {
    mockTransaction({ minorFound: false, guardianLinkFound: false });

    await expect(
      grantConsent(guardianSession, tenantSlug, {
        minorPersonId,
        type: "enrollment",
      }),
    ).rejects.toMatchObject({ code: "person_not_found" });
  });

  it("throws not_guardian without guardian relationship", async () => {
    mockTransaction({ minorFound: true, guardianLinkFound: false });

    await expect(
      grantConsent(guardianSession, tenantSlug, {
        minorPersonId,
        type: "enrollment",
      }),
    ).rejects.toMatchObject({ code: "not_guardian" });
  });

  it("throws already_granted when consent exists", async () => {
    mockTransaction({
      minorFound: true,
      guardianLinkFound: true,
      existingConsent: true,
    });

    await expect(
      grantConsent(guardianSession, tenantSlug, {
        minorPersonId,
        type: "enrollment",
      }),
    ).rejects.toMatchObject({ code: "already_granted" });
  });

  it("records enrollment consent and completes member consent status", async () => {
    const updateWhere = vi.fn(async () => undefined);
    const insertValues = vi.fn(() => ({
      returning: () => Promise.resolve([{ id: "consent-new" }]),
    }));

    getDb.mockReturnValue({
      transaction: vi.fn(async (callback: (tx: unknown) => Promise<unknown>) => {
        let selectFromCount = 0;
        let selectWhereCount = 0;

        const tx = {
          select: () => ({
            from: () => ({
              innerJoin: () => ({
                where: () => ({
                  limit: () => {
                    selectFromCount += 1;
                    return Promise.resolve([{ id: minorPersonId }]);
                  },
                }),
              }),
              where: () => ({
                limit: () => {
                  selectWhereCount += 1;
                  if (selectWhereCount === 1) {
                    return Promise.resolve([{ id: "rel-1" }]);
                  }
                  return Promise.resolve([]);
                },
              }),
            }),
          }),
          insert: () => ({
            values: insertValues,
          }),
          update: () => ({
            set: () => ({
              where: updateWhere,
            }),
          }),
        };

        return callback(tx);
      }),
    });

    const outcome = await grantConsent(guardianSession, tenantSlug, {
      minorPersonId,
      type: "enrollment",
    });

    expect(outcome.consentId).toBe("consent-new");
    expect(insertValues).toHaveBeenCalledWith(
      expect.objectContaining({
        personId: minorPersonId,
        guardianPersonId,
        type: "enrollment",
        granted: true,
        method: "portal_click",
      }),
    );
    expect(updateWhere).toHaveBeenCalled();
  });
});
