export type PayableInvoiceStatus = "open" | "partially_paid" | "overdue";

export const PAYABLE_INVOICE_STATUSES = new Set<PayableInvoiceStatus>([
  "open",
  "partially_paid",
  "overdue",
]);

export function resolveInvoiceStatusAfterPayment(paidCents: number, grossTotalCents: number) {
  if (paidCents >= grossTotalCents) {
    return "paid" as const;
  }

  if (paidCents > 0) {
    return "partially_paid" as const;
  }

  return "open" as const;
}

export function getInvoiceRemainingCents(grossTotalCents: number, paidCents: number) {
  return Math.max(grossTotalCents - paidCents, 0);
}
