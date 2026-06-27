import { beforeEach, describe, expect, it, vi } from "vitest";
import type { SessionContext } from "@afterhive/domain";
import {
  RecordMockPaymentError,
  recordMockPayment,
  resolveMockPaymentApplication,
} from "./record-mock-payment";

const getDb = vi.hoisted(() => vi.fn());

const selectResults = vi.hoisted(() => ({
  invoice: null as {
    invoiceId: string;
    tenantId: string;
    status: string;
    grossTotalCents: number;
    paidCents: number;
    currency: string;
  } | null,
}));

const txState = vi.hoisted(() => ({
  insertedPayment: null as Record<string, unknown> | null,
  updatedInvoice: null as Record<string, unknown> | null,
}));

vi.mock("@afterhive/db", () => ({
  getDb,
}));

vi.mock("./advance-dunning", () => ({
  resolveDunningForInvoice: vi.fn(),
}));

const financeSession: SessionContext = {
  userId: "finance-1",
  surface: "tenant_admin",
  tenantId: "tenant-1",
  tenantSlug: "demo-club",
  roles: ["tenant_finance"],
};

function mockTransaction() {
  return {
    select: () => ({
      from: () => ({
        innerJoin: () => ({
          where: () => ({
            for: () => ({
              limit: () => Promise.resolve(selectResults.invoice ? [selectResults.invoice] : []),
            }),
          }),
        }),
      }),
    }),
    insert: () => ({
      values: (values: Record<string, unknown>) => {
        txState.insertedPayment = values;
        return {
          returning: () => Promise.resolve([{ id: "payment-1" }]),
        };
      },
    }),
    update: () => ({
      set: (values: Record<string, unknown>) => ({
        where: () => {
          txState.updatedInvoice = values;
          return Promise.resolve();
        },
      }),
    }),
  };
}

function mockDb() {
  return {
    transaction: (fn: (tx: ReturnType<typeof mockTransaction>) => Promise<unknown>) =>
      fn(mockTransaction()),
  };
}

describe("resolveMockPaymentApplication", () => {
  it("rejects payment when the locked invoice is already fully paid", () => {
    expect(
      resolveMockPaymentApplication(
        {
          invoiceId: "invoice-1",
          tenantId: "tenant-1",
          status: "paid",
          grossTotalCents: 5355,
          paidCents: 5355,
          currency: "EUR",
        },
        100,
      ),
    ).toBe("invoice_not_payable");
  });
});

describe("recordMockPayment", () => {
  beforeEach(() => {
    selectResults.invoice = {
      invoiceId: "invoice-1",
      tenantId: "tenant-1",
      status: "open",
      grossTotalCents: 5355,
      paidCents: 0,
      currency: "EUR",
    };
    txState.insertedPayment = null;
    txState.updatedInvoice = null;
    getDb.mockReturnValue(mockDb());
  });

  it("records a mock payment and marks the invoice paid", async () => {
    const result = await recordMockPayment(financeSession, "demo-club", {
      invoiceId: "invoice-1",
    });

    expect(result).toMatchObject({
      paymentId: "payment-1",
      invoiceId: "invoice-1",
      invoiceStatus: "paid",
      paidCents: 5355,
      amountCents: 5355,
    });
    expect(txState.insertedPayment).toMatchObject({
      externalProvider: "mock",
      amountCents: 5355,
      status: "succeeded",
    });
    expect(txState.updatedInvoice).toMatchObject({
      paidCents: 5355,
      status: "paid",
    });
  });

  it("denies users without payment permission", async () => {
    await expect(
      recordMockPayment(
        { ...financeSession, roles: ["tenant_office"] },
        "demo-club",
        { invoiceId: "invoice-1" },
      ),
    ).rejects.toMatchObject({ code: "forbidden" satisfies RecordMockPaymentError["code"] });
  });

  it("rejects amounts above the remaining balance from the locked invoice row", async () => {
    await expect(
      recordMockPayment(financeSession, "demo-club", {
        invoiceId: "invoice-1",
        amountCents: 6000,
      }),
    ).rejects.toMatchObject({ code: "amount_exceeds_remaining" });
  });

  it("rejects payment when the locked invoice row is already fully paid", async () => {
    selectResults.invoice = {
      invoiceId: "invoice-1",
      tenantId: "tenant-1",
      status: "paid",
      grossTotalCents: 5355,
      paidCents: 5355,
      currency: "EUR",
    };

    await expect(
      recordMockPayment(financeSession, "demo-club", {
        invoiceId: "invoice-1",
      }),
    ).rejects.toMatchObject({ code: "invoice_not_payable" });
    expect(txState.insertedPayment).toBeNull();
  });
});
