import { beforeEach, describe, expect, it, vi } from "vitest";
import { generateCustomInvoices } from "./generate-custom-invoices";

const getDb = vi.hoisted(() => vi.fn());

const selectResults = vi.hoisted(() => ({
  contracts: [] as Array<{
    contractId: string;
    tenantId: string;
    customerProfileId: string;
    tariffSnapshot: unknown;
    startDate: string;
    endDate: string | null;
    customAmountCents: number | null;
  }>,
  existingInvoiceByContractId: {} as Record<string, { id: string }>,
  invoiceCount: 0,
}));

const insertedInvoices = vi.hoisted(() => [] as Array<Record<string, unknown>>);
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

describe("generateCustomInvoices", () => {
  beforeEach(() => {
    selectResults.contracts = [];
    selectResults.existingInvoiceByContractId = {};
    selectResults.invoiceCount = 0;
    insertedInvoices.length = 0;
    invoiceSequence.value = 0;
    getDb.mockReturnValue(mockDb());
  });

  it("creates a monthly custom invoice from contract.custom_amount_cents", async () => {
    selectResults.contracts = [
      {
        contractId: "contract-custom",
        tenantId: "tenant-1",
        customerProfileId: "customer-1",
        startDate: "2026-06-01",
        endDate: null,
        customAmountCents: 3000,
        tariffSnapshot: {
          id: "tariff-3",
          name: "Staff discount",
          model: "custom",
          config: {
            description: "Staff discount",
            billing_day: 1,
          },
          vat_rate: "0.19",
        },
      },
    ];

    const result = await generateCustomInvoices({ period: { year: 2026, month: 7 } });

    expect(result.created).toHaveLength(1);
    expect(result.created[0]).toMatchObject({
      contractId: "contract-custom",
      netTotalCents: 3000,
      vatTotalCents: 570,
      grossTotalCents: 3570,
    });
  });
});
