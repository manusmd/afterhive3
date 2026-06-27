import { beforeEach, describe, expect, it, vi } from "vitest";
import { generatePerSessionInvoices } from "./generate-per-session-invoices";

const getDb = vi.hoisted(() => vi.fn());

const selectResults = vi.hoisted(() => ({
  attendanceRows: [] as Array<Record<string, unknown>>,
  existingLine: null as { id: string } | null,
  existingInvoice: null as { id: string } | null,
  invoiceCount: 0,
  lineNetTotal: 0,
}));

const insertedInvoices = vi.hoisted(() => [] as Array<Record<string, unknown>>);
const insertedLineItems = vi.hoisted(() => [] as Array<Record<string, unknown>>);
const invoiceSequence = vi.hoisted(() => ({ value: 0 }));

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
              limit: () => Promise.resolve(selectResults.existingLine ? [selectResults.existingLine] : []),
            };
          }

          if (txSelectCall === 2) {
            return {
              limit: () =>
                Promise.resolve(selectResults.existingInvoice ? [selectResults.existingInvoice] : []),
            };
          }

          return Promise.resolve([{ netTotalCents: selectResults.lineNetTotal }]);
        },
      }),
    }),
    insert: () => ({
      values: (values: Record<string, unknown>) => {
        if ("invoiceNumber" in values || "status" in values) {
          invoiceSequence.value += 1;
          insertedInvoices.push(values);
          return {
            returning: () => Promise.resolve([{ id: `invoice-${invoiceSequence.value}` }]),
          };
        }

        insertedLineItems.push(values);
        selectResults.lineNetTotal += (values.netCents as number) ?? 0;
        return Promise.resolve();
      },
    }),
    update: () => ({
      set: () => ({
        where: () => Promise.resolve(),
      }),
    }),
  };
}

function mockDb() {
  return {
    select: () => ({
      from: () => ({
        innerJoin: () => ({
          innerJoin: () => ({
            innerJoin: () => ({
              leftJoin: () => ({
                where: () => Promise.resolve(selectResults.attendanceRows),
              }),
            }),
          }),
        }),
      }),
    }),
    transaction: (fn: (tx: ReturnType<typeof mockTransaction>) => Promise<unknown>) =>
      fn(mockTransaction()),
  };
}

describe("generatePerSessionInvoices", () => {
  beforeEach(() => {
    insertedInvoices.length = 0;
    insertedLineItems.length = 0;
    invoiceSequence.value = 0;
    selectResults.existingLine = null;
    selectResults.existingInvoice = null;
    selectResults.invoiceCount = 0;
    selectResults.lineNetTotal = 0;
    selectResults.attendanceRows = [
      {
        sessionId: "session-1",
        sessionTitle: "U12 Training",
        sessionEndsAt: new Date("2026-07-01T18:30:00.000Z"),
        status: "present",
        enrollmentId: "enrollment-1",
        contractId: "contract-1",
        tenantId: "tenant-1",
        customerProfileId: "customer-1",
        tariffSnapshot: {
          id: "tariff-1",
          name: "Training pro Einheit",
          model: "per_session",
          config: { amount_cents: 1500, bill_absent: false },
          vat_rate: "0.19",
        },
        contractStartDate: "2026-06-01",
        contractEndDate: null,
      },
    ];
    getDb.mockReturnValue(mockDb());
  });

  it("creates a session line with correct net, VAT, and gross totals", async () => {
    const result = await generatePerSessionInvoices({ period: { year: 2026, month: 7 } });

    expect(result.linesCreated).toHaveLength(1);
    expect(result.linesCreated[0]).toMatchObject({
      contractId: "contract-1",
      sessionId: "session-1",
      enrollmentId: "enrollment-1",
      netCents: 1500,
      vatCents: 285,
      grossCents: 1785,
    });
    expect(insertedLineItems[0]).toMatchObject({
      sessionId: "session-1",
      enrollmentId: "enrollment-1",
      netCents: 1500,
    });
  });

  it("skips non-billable attendance statuses", async () => {
    selectResults.attendanceRows = [
      {
        ...selectResults.attendanceRows[0],
        status: "absent",
      },
    ];

    const result = await generatePerSessionInvoices({ period: { year: 2026, month: 7 } });

    expect(result.linesCreated).toHaveLength(0);
    expect(result.skipped).toBe(1);
  });

  it("skips sessions before the contract start date", async () => {
    selectResults.attendanceRows = [
      {
        ...selectResults.attendanceRows[0],
        contractStartDate: "2026-07-15",
      },
    ];

    const result = await generatePerSessionInvoices({ period: { year: 2026, month: 7 } });

    expect(result.linesCreated).toHaveLength(0);
    expect(result.skipped).toBe(1);
    expect(insertedLineItems).toHaveLength(0);
  });

  it("skips sessions after the contract end date", async () => {
    selectResults.attendanceRows = [
      {
        ...selectResults.attendanceRows[0],
        contractEndDate: "2026-06-30",
      },
    ];

    const result = await generatePerSessionInvoices({ period: { year: 2026, month: 7 } });

    expect(result.linesCreated).toHaveLength(0);
    expect(result.skipped).toBe(1);
  });

  it("skips when an invoice line already exists for the session", async () => {
    selectResults.existingLine = { id: "existing-line" };

    const result = await generatePerSessionInvoices({ period: { year: 2026, month: 7 } });

    expect(result.linesCreated).toHaveLength(0);
    expect(result.skipped).toBe(1);
    expect(insertedLineItems).toHaveLength(0);
  });
});
