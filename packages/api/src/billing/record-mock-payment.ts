import { and, eq } from "drizzle-orm";
import { getDb } from "@afterhive/db";
import { invoices, paymentRecords, tenants } from "@afterhive/db/schema";
import type { SessionContext } from "@afterhive/domain";
import { canRecordPayment } from "./can-record-payment";
import {
  PAYABLE_INVOICE_STATUSES,
  getInvoiceRemainingCents,
  resolveInvoiceStatusAfterPayment,
} from "./invoice-payment-status";

export type RecordMockPaymentInput = {
  invoiceId: string;
  amountCents?: number;
};

export type RecordMockPaymentResult = {
  paymentId: string;
  invoiceId: string;
  invoiceStatus: "partially_paid" | "paid";
  paidCents: number;
  amountCents: number;
};

export class RecordMockPaymentError extends Error {
  constructor(
    readonly code:
      | "tenant_not_found"
      | "forbidden"
      | "missing_fields"
      | "invoice_not_found"
      | "invoice_not_payable"
      | "invalid_amount"
      | "amount_exceeds_remaining",
  ) {
    super(code);
    this.name = "RecordMockPaymentError";
  }
}

export function validateRecordMockPaymentInput(input: RecordMockPaymentInput) {
  if (typeof input.invoiceId !== "string" || input.invoiceId.length === 0) {
    return "missing_fields" as const;
  }

  if (
    input.amountCents !== undefined &&
    (!Number.isInteger(input.amountCents) || input.amountCents <= 0)
  ) {
    return "invalid_amount" as const;
  }

  return null;
}

export async function recordMockPayment(
  session: SessionContext,
  tenantSlug: string,
  input: RecordMockPaymentInput,
): Promise<RecordMockPaymentResult> {
  const validationError = validateRecordMockPaymentInput(input);

  if (validationError) {
    throw new RecordMockPaymentError(validationError);
  }

  if (!session.tenantId || !canRecordPayment(session.roles)) {
    throw new RecordMockPaymentError("forbidden");
  }

  const db = getDb();
  const [invoiceRow] = await db
    .select({
      invoiceId: invoices.id,
      tenantId: invoices.tenantId,
      status: invoices.status,
      grossTotalCents: invoices.grossTotalCents,
      paidCents: invoices.paidCents,
      currency: invoices.currency,
    })
    .from(invoices)
    .innerJoin(tenants, eq(invoices.tenantId, tenants.id))
    .where(
      and(
        eq(invoices.id, input.invoiceId),
        eq(invoices.tenantId, session.tenantId),
        eq(tenants.slug, tenantSlug),
      ),
    )
    .limit(1);

  if (!invoiceRow) {
    throw new RecordMockPaymentError("invoice_not_found");
  }

  if (!PAYABLE_INVOICE_STATUSES.has(invoiceRow.status as "open" | "partially_paid" | "overdue")) {
    throw new RecordMockPaymentError("invoice_not_payable");
  }

  const remainingCents = getInvoiceRemainingCents(
    invoiceRow.grossTotalCents,
    invoiceRow.paidCents,
  );

  if (remainingCents === 0) {
    throw new RecordMockPaymentError("invoice_not_payable");
  }

  const amountCents = input.amountCents ?? remainingCents;

  if (amountCents > remainingCents) {
    throw new RecordMockPaymentError("amount_exceeds_remaining");
  }

  const paidAt = new Date();
  const nextPaidCents = invoiceRow.paidCents + amountCents;
  const nextStatus = resolveInvoiceStatusAfterPayment(nextPaidCents, invoiceRow.grossTotalCents);

  if (nextStatus === "open") {
    throw new RecordMockPaymentError("invalid_amount");
  }

  return db.transaction(async (tx) => {
    const [payment] = await tx
      .insert(paymentRecords)
      .values({
        tenantId: invoiceRow.tenantId,
        invoiceId: invoiceRow.invoiceId,
        externalProvider: "mock",
        externalId: `mock_${paidAt.getTime()}`,
        amountCents,
        currency: invoiceRow.currency,
        status: "succeeded",
        paidAt,
      })
      .returning({ id: paymentRecords.id });

    if (!payment) {
      throw new RecordMockPaymentError("invoice_not_found");
    }

    await tx
      .update(invoices)
      .set({
        paidCents: nextPaidCents,
        status: nextStatus,
      })
      .where(eq(invoices.id, invoiceRow.invoiceId));

    return {
      paymentId: payment.id,
      invoiceId: invoiceRow.invoiceId,
      invoiceStatus: nextStatus,
      paidCents: nextPaidCents,
      amountCents,
    };
  });
}
