import { beforeEach, describe, expect, it, vi } from "vitest";
import { generateEnrollmentInvoices } from "./generate-enrollment-invoices";

const getDb = vi.hoisted(() => vi.fn());

const selectResults = vi.hoisted(() => ({
  contracts: [] as Array<{
    contractId: string;
    tenantId: string;
    customerProfileId: string;
    enrollmentId: string | null;
    tariffSnapshot: unknown;
    startDate: string;
  }>,
  existingInvoiceByContractId: {} as Record<string, { id: string }>,
  invoiceCount: 0,
}));

const insertedInvoices = vi.hoisted(() => [] as Array<Record<string, unknown>>);
const insertedLineItems = vi.hoisted(() => [] as Array<Record<string, unknown>>);
const invoiceSequence = vi.hoisted(() => ({ value: 0 }));

vi.mock("@afterhive/db", () => ({
  getDb,
}));

function mockTransaction(contractId: string) {
  let txSelectCall = 0;

  return {
    select: () => ({
      from: () => ({
        where: () => {
          txSelectCall += 1;

          if (txSelectCall === 1) {
            const existing = selectResults.existingInvoiceByContractId[contractId];
            return {
              limit: () => Promise.resolve(existing ? [existing] : []),
            };
          }

          return Promise.resolve([{ count: selectResults.invoiceCount + invoiceSequence.value }]);
        },
      }),
    }),
    insert: () => ({
      values: (values: Record<string, unknown>) => {
        if ("invoiceNumber" in values || "status" in values) {
          invoiceSequence.value += 1;
          const invoice = {
            id: `invoice-${invoiceSequence.value}`,
            invoiceNumber: `RE2026-${String(invoiceSequence.value).padStart(5, "0")}`,
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
    transaction: (fn: (tx: ReturnType<typeof mockTransaction>) => Promise<unknown>) => {
      const contractId = selectResults.contracts[0]?.contractId ?? "contract-1";
      return fn(mockTransaction(contractId));
    },
  };
}

describe("generateEnrollmentInvoices", () => {
  beforeEach(() => {
    selectResults.contracts = [];
    selectResults.existingInvoiceByContractId = {};
    selectResults.invoiceCount = 0;
    insertedInvoices.length = 0;
    insertedLineItems.length = 0;
    invoiceSequence.value = 0;
    getDb.mockReturnValue(mockDb());
  });

  it("creates a package invoice with the configured flat amount", async () => {
    selectResults.contracts = [
      {
        contractId: "contract-package",
        tenantId: "tenant-1",
        customerProfileId: "customer-1",
        enrollmentId: "enrollment-1",
        startDate: "2026-06-01",
        tariffSnapshot: {
          id: "tariff-1",
          name: "10-session card",
          model: "package",
          config: {
            amount_cents: 13000,
            sessions_included: 10,
            valid_days: 90,
          },
          vat_rate: "0.19",
        },
      },
    ];

    const result = await generateEnrollmentInvoices();

    expect(result.created).toHaveLength(1);
    expect(result.created[0]).toMatchObject({
      contractId: "contract-package",
      netTotalCents: 13000,
      vatTotalCents: 2470,
      grossTotalCents: 15470,
    });
    expect(insertedInvoices[0]).toMatchObject({
      servicePeriodStart: "2026-06-01",
      servicePeriodEnd: "2026-08-29",
    });
  });

  it("pro-rates a season invoice for a mid-season contract start", async () => {
    selectResults.contracts = [
      {
        contractId: "contract-season",
        tenantId: "tenant-1",
        customerProfileId: "customer-1",
        enrollmentId: "enrollment-1",
        startDate: "2026-01-15",
        tariffSnapshot: {
          id: "tariff-2",
          name: "Season 2025/26 U14",
          model: "season",
          config: {
            amount_cents: 32000,
            season_id: "season-1",
            season_start: "2025-09-01",
            season_end: "2026-06-30",
          },
          vat_rate: "0.19",
        },
      },
    ];

    const result = await generateEnrollmentInvoices();

    expect(result.created).toHaveLength(1);
    expect(result.created[0]).toMatchObject({
      contractId: "contract-season",
      netTotalCents: 17637,
      vatTotalCents: 3351,
      grossTotalCents: 20988,
    });
  });
});
