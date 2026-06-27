import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  generateRecurringInvoices,
  validateBillingPeriod,
} from "./generate-recurring-invoices";

const getDb = vi.hoisted(() => vi.fn());

const selectResults = vi.hoisted(() => ({
  contracts: [] as Array<{
    contractId: string;
    tenantId: string;
    customerProfileId: string;
    tariffSnapshot: unknown;
    startDate: string;
    endDate: string | null;
    enrollmentId: string | null;
  }>,
  existingInvoice: null as { id: string } | null,
  invoiceCount: 0,
}));

const insertedInvoices = vi.hoisted(() => [] as Array<Record<string, unknown>>);
const insertedLineItems = vi.hoisted(() => [] as Array<Record<string, unknown>>);

vi.mock("@afterhive/db", () => ({
  getDb,
}));

function mockTransaction() {
  let txSelectCall = 0;

  return {
    select: () => ({
      from: () => ({
        where: () => {
          txSelectCall += 1;

          if (txSelectCall === 1) {
            return {
              limit: () =>
                Promise.resolve(selectResults.existingInvoice ? [selectResults.existingInvoice] : []),
            };
          }

          return Promise.resolve([{ count: selectResults.invoiceCount }]);
        },
      }),
    }),
    insert: () => ({
      values: (values: Record<string, unknown>) => {
        if ("invoiceNumber" in values || "status" in values) {
          const invoice = {
            id: "invoice-1",
            invoiceNumber: "RE2026-00001",
            netTotalCents: values.netTotalCents,
            vatTotalCents: values.vatTotalCents,
            grossTotalCents: values.grossTotalCents,
          };
          insertedInvoices.push(values);
          return {
            returning: () => Promise.resolve([invoice]),
          };
        }

        insertedLineItems.push(values);
        return Promise.resolve();
      },
    }),
  };
}

function mockDb() {
  return {
    select: () => ({
      from: () => ({
        where: () => Promise.resolve(selectResults.contracts),
      }),
    }),
    transaction: (fn: (tx: ReturnType<typeof mockTransaction>) => Promise<unknown>) =>
      fn(mockTransaction()),
  };
}

describe("validateBillingPeriod", () => {
  it("rejects invalid months", () => {
    expect(validateBillingPeriod({ year: 2026, month: 13 })).toBe("invalid_period");
  });
});

describe("generateRecurringInvoices", () => {
  beforeEach(() => {
    insertedInvoices.length = 0;
    insertedLineItems.length = 0;
    selectResults.existingInvoice = null;
    selectResults.invoiceCount = 0;
    selectResults.contracts = [
      {
        contractId: "contract-1",
        tenantId: "tenant-1",
        customerProfileId: "customer-1",
        tariffSnapshot: {
          id: "tariff-1",
          name: "U12 Mitgliedschaft",
          model: "fixed_monthly",
          config: { amount_cents: 4500, billing_day: 1 },
          vat_rate: "0.19",
        },
        startDate: "2026-01-01",
        endDate: null,
        enrollmentId: null,
      },
    ];
    getDb.mockReturnValue(mockDb());
  });

  it("creates invoice with correct net, VAT, and gross totals", async () => {
    const result = await generateRecurringInvoices({ period: { year: 2026, month: 7 } });

    expect(result.created).toHaveLength(1);
    expect(result.created[0]).toMatchObject({
      contractId: "contract-1",
      netTotalCents: 4500,
      vatTotalCents: 855,
      grossTotalCents: 5355,
    });
    expect(insertedInvoices[0]).toMatchObject({
      servicePeriodStart: "2026-07-01",
      servicePeriodEnd: "2026-07-31",
      issueDate: "2026-07-01",
      dueDate: "2026-07-15",
      status: "open",
    });
    expect(insertedLineItems[0]).toMatchObject({
      description: "U12 Mitgliedschaft 2026-07",
      netCents: 4500,
      unitPriceCents: 4500,
    });
  });

  it("skips when invoice already exists for the service period", async () => {
    selectResults.existingInvoice = { id: "existing-invoice" };

    const result = await generateRecurringInvoices({ period: { year: 2026, month: 7 } });

    expect(result.created).toHaveLength(0);
    expect(result.skipped).toBe(1);
    expect(insertedInvoices).toHaveLength(0);
  });

  it("skips non fixed_monthly contracts", async () => {
    selectResults.contracts = [
      {
        contractId: "contract-2",
        tenantId: "tenant-1",
        customerProfileId: "customer-1",
        tariffSnapshot: {
          id: "tariff-2",
          name: "Drop-in",
          model: "per_session",
          config: { amount_cents: 1500, bill_absent: false },
          vat_rate: "0.19",
        },
        startDate: "2026-01-01",
        endDate: null,
        enrollmentId: null,
      },
    ];

    const result = await generateRecurringInvoices({ period: { year: 2026, month: 7 } });

    expect(result.created).toHaveLength(0);
    expect(result.skipped).toBe(1);
  });
});
