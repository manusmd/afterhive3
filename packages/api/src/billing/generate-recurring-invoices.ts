import { and, eq, sql } from "drizzle-orm";
import { getDb } from "@afterhive/db";
import { contracts, invoiceLineItems, invoices } from "@afterhive/db/schema";
import {
  addDays,
  buildInvoiceNumber,
  calculateAmountsFromNet,
  getCalendarMonthBounds,
  isContractActiveForPeriod,
  parseVatRate,
  resolveIssueDate,
  validateBillingPeriod,
  type BillingPeriod,
} from "./invoice-amounts";
import { parseFixedMonthlyConfig, parseTariffSnapshot } from "./tariff-snapshot";

export type { BillingPeriod };
export { validateBillingPeriod } from "./invoice-amounts";

export type GenerateRecurringInvoicesInput = {
  period: BillingPeriod;
  paymentTermsDays?: number;
};

export type GeneratedRecurringInvoice = {
  invoiceId: string;
  contractId: string;
  invoiceNumber: string;
  netTotalCents: number;
  vatTotalCents: number;
  grossTotalCents: number;
};

export type GenerateRecurringInvoicesResult = {
  created: GeneratedRecurringInvoice[];
  skipped: number;
};

const PAYMENT_TERMS_DAYS = 14;

export async function generateRecurringInvoices(
  input: GenerateRecurringInvoicesInput,
): Promise<GenerateRecurringInvoicesResult> {
  const periodError = validateBillingPeriod(input.period);

  if (periodError) {
    throw new Error(periodError);
  }

  const paymentTermsDays = input.paymentTermsDays ?? PAYMENT_TERMS_DAYS;
  const { year, month } = input.period;
  const { servicePeriodStart, servicePeriodEnd } = getCalendarMonthBounds(year, month);

  const db = getDb();
  const activeContracts = await db
    .select({
      contractId: contracts.id,
      tenantId: contracts.tenantId,
      customerProfileId: contracts.customerProfileId,
      tariffSnapshot: contracts.tariffSnapshot,
      startDate: contracts.startDate,
      endDate: contracts.endDate,
      enrollmentId: contracts.enrollmentId,
    })
    .from(contracts)
    .where(eq(contracts.status, "active"));

  const created: GeneratedRecurringInvoice[] = [];
  let skipped = 0;

  for (const contract of activeContracts) {
    const snapshot = parseTariffSnapshot(contract.tariffSnapshot);

    if (!snapshot || snapshot.model !== "fixed_monthly") {
      skipped += 1;
      continue;
    }

    const config = parseFixedMonthlyConfig(snapshot.config);

    if (!config) {
      skipped += 1;
      continue;
    }

    if (
      !isContractActiveForPeriod(
        contract.startDate,
        contract.endDate,
        servicePeriodStart,
        servicePeriodEnd,
      )
    ) {
      skipped += 1;
      continue;
    }

    const vatRate = parseVatRate(snapshot.vat_rate);

    if (vatRate === null) {
      skipped += 1;
      continue;
    }

    const issueDate = resolveIssueDate(year, month, config.billing_day);
    const dueDate = addDays(issueDate, paymentTermsDays);
    const totals = calculateAmountsFromNet(config.amount_cents, vatRate);
    const description = `${snapshot.name} ${year}-${String(month).padStart(2, "0")}`;

    const invoice = await db.transaction(async (tx) => {
      const [existing] = await tx
        .select({ id: invoices.id })
        .from(invoices)
        .where(
          and(
            eq(invoices.tenantId, contract.tenantId),
            eq(invoices.contractId, contract.contractId),
            eq(invoices.servicePeriodStart, servicePeriodStart),
            eq(invoices.servicePeriodEnd, servicePeriodEnd),
          ),
        )
        .limit(1);

      if (existing) {
        return null;
      }

      const [countRow] = await tx
        .select({ count: sql<number>`count(*)::int` })
        .from(invoices)
        .where(
          and(
            eq(invoices.tenantId, contract.tenantId),
            sql`extract(year from ${invoices.issueDate}) = ${year}`,
          ),
        );

      const invoiceNumber = buildInvoiceNumber(year, (countRow?.count ?? 0) + 1);

      const [insertedInvoice] = await tx
        .insert(invoices)
        .values({
          tenantId: contract.tenantId,
          customerProfileId: contract.customerProfileId,
          contractId: contract.contractId,
          invoiceNumber,
          status: "open",
          issueDate,
          dueDate,
          servicePeriodStart,
          servicePeriodEnd,
          netTotalCents: totals.netCents,
          vatTotalCents: totals.vatCents,
          grossTotalCents: totals.grossCents,
          paidCents: 0,
          currency: "EUR",
        })
        .returning({
          id: invoices.id,
          invoiceNumber: invoices.invoiceNumber,
          netTotalCents: invoices.netTotalCents,
          vatTotalCents: invoices.vatTotalCents,
          grossTotalCents: invoices.grossTotalCents,
        });

      if (!insertedInvoice) {
        return null;
      }

      await tx.insert(invoiceLineItems).values({
        tenantId: contract.tenantId,
        invoiceId: insertedInvoice.id,
        description,
        quantity: "1",
        unitPriceCents: config.amount_cents,
        vatRate: snapshot.vat_rate,
        netCents: totals.netCents,
        enrollmentId: contract.enrollmentId,
      });

      return insertedInvoice;
    });

    if (!invoice) {
      skipped += 1;
      continue;
    }

    created.push({
      invoiceId: invoice.id,
      contractId: contract.contractId,
      invoiceNumber: invoice.invoiceNumber,
      netTotalCents: invoice.netTotalCents,
      vatTotalCents: invoice.vatTotalCents,
      grossTotalCents: invoice.grossTotalCents,
    });
  }

  return { created, skipped };
}
