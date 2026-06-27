import { beforeEach, describe, expect, it, vi } from "vitest";
import { advanceDunning, isInvoiceOverdue } from "./advance-dunning";

const getDb = vi.hoisted(() => vi.fn());
const queueDunningEmail = vi.hoisted(() => vi.fn());

const selectResults = vi.hoisted(() => ({
  candidates: [] as Array<{
    invoiceId: string;
    tenantId: string;
    dueDate: string;
    status: string;
    grossTotalCents: number;
    paidCents: number;
    recipientEmail: string | null;
  }>,
  lockedInvoice: null as {
    invoiceId: string;
    tenantId: string;
    dueDate: string;
    status: string;
    grossTotalCents: number;
    paidCents: number;
  } | null,
  existingCase: null as { id: string } | null,
}));

const txState = vi.hoisted(() => ({
  updatedInvoiceStatus: null as string | null,
  insertedCase: null as Record<string, unknown> | null,
}));

vi.mock("@afterhive/db", () => ({
  getDb,
}));

vi.mock("../email/queue-dunning-email", () => ({
  queueDunningEmail,
}));

function mockTransaction() {
  return {
    select: () => ({
      from: () => ({
        where: () => ({
          for: () => ({
            limit: () => Promise.resolve(selectResults.lockedInvoice ? [selectResults.lockedInvoice] : []),
          }),
          limit: () => Promise.resolve(selectResults.existingCase ? [selectResults.existingCase] : []),
        }),
      }),
    }),
    update: () => ({
      set: (values: { status?: string }) => ({
        where: () => {
          if (values.status) {
            txState.updatedInvoiceStatus = values.status;
          }
          return Promise.resolve();
        },
      }),
    }),
    insert: () => ({
      values: (values: Record<string, unknown>) => {
        txState.insertedCase = values;
        return {
          returning: () => Promise.resolve([{ id: "dunning-case-1" }]),
        };
      },
    }),
  };
}

function mockDb() {
  return {
    select: () => ({
      from: () => ({
        innerJoin: () => ({
          leftJoin: () => ({
            leftJoin: () => ({
              where: () => Promise.resolve(selectResults.candidates),
            }),
          }),
        }),
      }),
    }),
    transaction: (fn: (tx: ReturnType<typeof mockTransaction>) => Promise<unknown>) =>
      fn(mockTransaction()),
  };
}

describe("isInvoiceOverdue", () => {
  it("returns true for unpaid open invoices past due date", () => {
    expect(isInvoiceOverdue("2026-06-01", "open", 5355, 0, "2026-06-26")).toBe(true);
  });

  it("returns false for paid invoices", () => {
    expect(isInvoiceOverdue("2026-06-01", "paid", 5355, 5355, "2026-06-26")).toBe(false);
  });
});

describe("advanceDunning", () => {
  beforeEach(() => {
    selectResults.candidates = [
      {
        invoiceId: "invoice-1",
        tenantId: "tenant-1",
        dueDate: "2026-06-01",
        status: "open",
        grossTotalCents: 5355,
        paidCents: 0,
        recipientEmail: "guardian@demo-club.de",
      },
    ];
    selectResults.lockedInvoice = {
      invoiceId: "invoice-1",
      tenantId: "tenant-1",
      dueDate: "2026-06-01",
      status: "open",
      grossTotalCents: 5355,
      paidCents: 0,
    };
    selectResults.existingCase = null;
    txState.updatedInvoiceStatus = null;
    txState.insertedCase = null;
    queueDunningEmail.mockClear();
    queueDunningEmail.mockResolvedValue({ template: "dunning_1" });
    getDb.mockReturnValue(mockDb());
  });

  it("marks overdue invoices, opens dunning stage 1, and queues email", async () => {
    const result = await advanceDunning({ asOfDate: "2026-06-26" });

    expect(result).toEqual({
      overdueMarked: 1,
      casesCreated: 1,
      emailsQueued: 1,
      skipped: 0,
    });
    expect(txState.updatedInvoiceStatus).toBe("overdue");
    expect(txState.insertedCase).toMatchObject({
      tenantId: "tenant-1",
      invoiceId: "invoice-1",
      stage: 1,
      status: "open",
    });
    expect(queueDunningEmail).toHaveBeenCalledWith({
      tenantId: "tenant-1",
      invoiceId: "invoice-1",
      dunningCaseId: "dunning-case-1",
      stage: 1,
      recipientEmail: "guardian@demo-club.de",
    });
  });

  it("skips invoices that are no longer overdue inside the transaction", async () => {
    selectResults.lockedInvoice = {
      invoiceId: "invoice-1",
      tenantId: "tenant-1",
      dueDate: "2026-07-01",
      status: "open",
      grossTotalCents: 5355,
      paidCents: 0,
    };

    const result = await advanceDunning({ asOfDate: "2026-06-26" });

    expect(result).toEqual({
      overdueMarked: 0,
      casesCreated: 0,
      emailsQueued: 0,
      skipped: 1,
    });
    expect(queueDunningEmail).not.toHaveBeenCalled();
  });
});
