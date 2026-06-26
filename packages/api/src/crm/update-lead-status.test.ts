import { beforeEach, describe, expect, it, vi } from "vitest";
import type { SessionContext } from "@afterhive/domain";
import { UpdateLeadStatusError, updateLeadStatus } from "./update-lead-status";

const tenantId = "tenant-1";
const tenantSlug = "demo-club";
const locationNorth = "loc-north";
const leadId = "lead-1";

const getDb = vi.hoisted(() => vi.fn());

vi.mock("@afterhive/db", () => ({
  getDb,
}));

const officeSession: SessionContext = {
  userId: "staff-1",
  surface: "tenant_admin",
  tenantId,
  tenantSlug,
  roles: ["tenant_office"],
  locationIds: [locationNorth],
  roleAssignments: [{ role: "tenant_office", locationIds: [locationNorth] }],
};

function mockTransaction(options: {
  lead: { id: string; locationId: string; status: string } | null;
  updatedLead?: Record<string, unknown> | null;
}) {
  const transaction = vi.fn(async (callback: (tx: unknown) => Promise<unknown>) => {
    const tx = {
      select: () => ({
        from: () => ({
          innerJoin: () => ({
            where: () => ({
              for: () => ({
                limit: () => Promise.resolve(options.lead ? [options.lead] : []),
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
                options.updatedLead === undefined
                  ? [
                      {
                        id: leadId,
                        status: "contacted",
                        lostReason: null,
                        lastActivityAt: new Date("2026-06-26T12:00:00.000Z"),
                      },
                    ]
                  : options.updatedLead
                    ? [options.updatedLead]
                    : [],
              ),
          }),
        }),
      }),
    };

    return callback(tx);
  });

  getDb.mockReturnValue({ transaction });
  return transaction;
}

describe("updateLeadStatus", () => {
  beforeEach(() => {
    getDb.mockReset();
  });

  it("throws invalid_transition for disallowed status changes", async () => {
    mockTransaction({
      lead: { id: leadId, locationId: locationNorth, status: "new" },
    });

    await expect(
      updateLeadStatus(officeSession, tenantSlug, leadId, { status: "qualified" }),
    ).rejects.toMatchObject({ code: "invalid_transition" });
  });

  it("requires lost reason when marking lost", async () => {
    await expect(
      updateLeadStatus(officeSession, tenantSlug, leadId, { status: "lost" }),
    ).rejects.toMatchObject({ code: "missing_lost_reason" });

    expect(getDb).not.toHaveBeenCalled();
  });

  it("updates status within a transaction", async () => {
    const transaction = mockTransaction({
      lead: { id: leadId, locationId: locationNorth, status: "new" },
    });

    await expect(
      updateLeadStatus(officeSession, tenantSlug, leadId, { status: "contacted" }),
    ).resolves.toEqual({
      leadId,
      status: "contacted",
      lostReason: null,
      lastActivityAt: "2026-06-26T12:00:00.000Z",
    });

    expect(transaction).toHaveBeenCalledOnce();
  });

  it("forbids reopening lost leads for office staff", async () => {
    mockTransaction({
      lead: { id: leadId, locationId: locationNorth, status: "lost" },
    });

    await expect(
      updateLeadStatus(officeSession, tenantSlug, leadId, { status: "new" }),
    ).rejects.toMatchObject({ code: "reopen_forbidden" });
  });

  it("throws invalid_transition when guarded update matches no row", async () => {
    mockTransaction({
      lead: { id: leadId, locationId: locationNorth, status: "new" },
      updatedLead: null,
    });

    await expect(
      updateLeadStatus(officeSession, tenantSlug, leadId, { status: "contacted" }),
    ).rejects.toMatchObject({ code: "invalid_transition" });
  });
});
