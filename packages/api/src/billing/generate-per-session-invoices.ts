import { and, eq, gte, inArray, isNull, lte, sql } from "drizzle-orm";
import { getDb } from "@afterhive/db";
import {
  attendanceRecords,
  contracts,
  enrollments,
  invoiceLineItems,
  invoices,
  sessions,
} from "@afterhive/db/schema";
import {
  addDays,
  buildInvoiceNumber,
  calculateAmountsFromNet,
  getCalendarMonthBounds,
  isContractActiveForPeriod,
  parseVatRate,
  validateBillingPeriod,
} from "./invoice-amounts";
import {
  parsePerSessionConfig,
  parseTariffSnapshot,
  shouldBillAttendanceStatus,
} from "./tariff-snapshot";

export type GeneratePerSessionInvoicesInput = {
  period: { year: number; month: number };
  paymentTermsDays?: number;
};

export type GeneratedPerSessionLine = {
  invoiceId: string;
  contractId: string;
  sessionId: string;
  enrollmentId: string;
  netCents: number;
  vatCents: number;
  grossCents: number;
};

export type GeneratePerSessionInvoicesResult = {
  linesCreated: GeneratedPerSessionLine[];
  skipped: number;
};

const PAYMENT_TERMS_DAYS = 14;
const ACTIVE_ENROLLMENT_STATUSES = ["active", "pending"] as const;

type BillableAttendanceRow = {
  sessionId: string;
  sessionTitle: string | null;
  sessionEndsAt: Date;
  status: "present" | "absent" | "excused" | "late";
  enrollmentId: string;
  contractId: string;
  tenantId: string;
  customerProfileId: string;
  tariffSnapshot: unknown;
  contractStartDate: string;
  contractEndDate: string | null;
};

export async function generatePerSessionInvoices(
  input: GeneratePerSessionInvoicesInput,
): Promise<GeneratePerSessionInvoicesResult> {
  const periodError = validateBillingPeriod(input.period);

  if (periodError) {
    throw new Error(periodError);
  }

  const paymentTermsDays = input.paymentTermsDays ?? PAYMENT_TERMS_DAYS;
  const { year, month } = input.period;
  const { servicePeriodStart, servicePeriodEnd } = getCalendarMonthBounds(year, month);
  const periodStartAt = new Date(`${servicePeriodStart}T00:00:00.000Z`);
  const periodEndAt = new Date(`${servicePeriodEnd}T23:59:59.999Z`);

  const db = getDb();
  const attendanceRows = await db
    .select({
      sessionId: sessions.id,
      sessionTitle: sessions.title,
      sessionEndsAt: sessions.endsAt,
      status: attendanceRecords.status,
      enrollmentId: enrollments.id,
      contractId: contracts.id,
      tenantId: contracts.tenantId,
      customerProfileId: contracts.customerProfileId,
      tariffSnapshot: contracts.tariffSnapshot,
      contractStartDate: contracts.startDate,
      contractEndDate: contracts.endDate,
    })
    .from(attendanceRecords)
    .innerJoin(sessions, eq(attendanceRecords.sessionId, sessions.id))
    .innerJoin(
      enrollments,
      and(
        eq(enrollments.memberProfileId, attendanceRecords.memberProfileId),
        eq(enrollments.offerGroupId, sessions.offerGroupId),
        inArray(enrollments.status, [...ACTIVE_ENROLLMENT_STATUSES]),
      ),
    )
    .innerJoin(
      contracts,
      and(eq(contracts.enrollmentId, enrollments.id), eq(contracts.status, "active")),
    )
    .leftJoin(
      invoiceLineItems,
      and(
        eq(invoiceLineItems.sessionId, attendanceRecords.sessionId),
        eq(invoiceLineItems.enrollmentId, enrollments.id),
      ),
    )
    .where(
      and(
        isNull(invoiceLineItems.id),
        gte(sessions.endsAt, periodStartAt),
        lte(sessions.endsAt, periodEndAt),
      ),
    );

  const linesCreated: GeneratedPerSessionLine[] = [];
  let skipped = 0;

  for (const row of attendanceRows) {
    const billable = resolveBillableAttendance(row, servicePeriodStart, servicePeriodEnd);

    if (!billable) {
      skipped += 1;
      continue;
    }

    const line = await db.transaction(async (tx) => {
      const [existingLine] = await tx
        .select({ id: invoiceLineItems.id })
        .from(invoiceLineItems)
        .where(
          and(
            eq(invoiceLineItems.tenantId, billable.tenantId),
            eq(invoiceLineItems.sessionId, billable.sessionId),
            eq(invoiceLineItems.enrollmentId, billable.enrollmentId),
          ),
        )
        .limit(1);

      if (existingLine) {
        return null;
      }

      let invoiceId: string;

      const [existingInvoice] = await tx
        .select({ id: invoices.id })
        .from(invoices)
        .where(
          and(
            eq(invoices.tenantId, billable.tenantId),
            eq(invoices.contractId, billable.contractId),
            eq(invoices.servicePeriodStart, servicePeriodStart),
            eq(invoices.servicePeriodEnd, servicePeriodEnd),
          ),
        )
        .limit(1);

      if (existingInvoice) {
        invoiceId = existingInvoice.id;
      } else {
        const [countRow] = await tx
          .select({ count: sql<number>`count(*)::int` })
          .from(invoices)
          .where(
            and(
              eq(invoices.tenantId, billable.tenantId),
              sql`extract(year from ${invoices.issueDate}) = ${year}`,
            ),
          );

        const issueDate = servicePeriodEnd;
        const dueDate = addDays(issueDate, paymentTermsDays);
        const invoiceNumber = buildInvoiceNumber(year, (countRow?.count ?? 0) + 1);

        const [insertedInvoice] = await tx
          .insert(invoices)
          .values({
            tenantId: billable.tenantId,
            customerProfileId: billable.customerProfileId,
            contractId: billable.contractId,
            invoiceNumber,
            status: "open",
            issueDate,
            dueDate,
            servicePeriodStart,
            servicePeriodEnd,
            netTotalCents: 0,
            vatTotalCents: 0,
            grossTotalCents: 0,
            paidCents: 0,
            currency: "EUR",
          })
          .returning({ id: invoices.id });

        if (!insertedInvoice) {
          return null;
        }

        invoiceId = insertedInvoice.id;
      }

      await tx.insert(invoiceLineItems).values({
        tenantId: billable.tenantId,
        invoiceId,
        description: `${billable.description} ${servicePeriodStart.slice(0, 7)}`,
        quantity: "1",
        unitPriceCents: billable.amountCents,
        vatRate: billable.vatRate,
        netCents: billable.totals.netCents,
        enrollmentId: billable.enrollmentId,
        sessionId: billable.sessionId,
      });

      const [totalsRow] = await tx
        .select({
          netTotalCents: sql<number>`coalesce(sum(${invoiceLineItems.netCents}), 0)::int`,
        })
        .from(invoiceLineItems)
        .where(eq(invoiceLineItems.invoiceId, invoiceId));

      const netTotalCents = totalsRow?.netTotalCents ?? billable.totals.netCents;
      const invoiceTotals = calculateAmountsFromNet(netTotalCents, billable.vatRateNumber);

      await tx
        .update(invoices)
        .set({
          netTotalCents: invoiceTotals.netCents,
          vatTotalCents: invoiceTotals.vatCents,
          grossTotalCents: invoiceTotals.grossCents,
        })
        .where(eq(invoices.id, invoiceId));

      return {
        invoiceId,
        contractId: billable.contractId,
        sessionId: billable.sessionId,
        enrollmentId: billable.enrollmentId,
        netCents: billable.totals.netCents,
        vatCents: billable.totals.vatCents,
        grossCents: billable.totals.grossCents,
      };
    });

    if (!line) {
      skipped += 1;
      continue;
    }

    linesCreated.push(line);
  }

  return { linesCreated, skipped };
}

function resolveBillableAttendance(
  row: BillableAttendanceRow,
  servicePeriodStart: string,
  servicePeriodEnd: string,
) {
  const snapshot = parseTariffSnapshot(row.tariffSnapshot);

  if (!snapshot || snapshot.model !== "per_session") {
    return null;
  }

  const config = parsePerSessionConfig(snapshot.config);

  if (!config) {
    return null;
  }

  if (
    !isContractActiveForPeriod(
      row.contractStartDate,
      row.contractEndDate,
      servicePeriodStart,
      servicePeriodEnd,
    )
  ) {
    return null;
  }

  if (!shouldBillAttendanceStatus(row.status, config.bill_absent)) {
    return null;
  }

  const vatRateNumber = parseVatRate(snapshot.vat_rate);

  if (vatRateNumber === null) {
    return null;
  }

  const totals = calculateAmountsFromNet(config.amount_cents, vatRateNumber);

  return {
    tenantId: row.tenantId,
    customerProfileId: row.customerProfileId,
    contractId: row.contractId,
    enrollmentId: row.enrollmentId,
    sessionId: row.sessionId,
    description: row.sessionTitle ?? "Training",
    amountCents: config.amount_cents,
    vatRate: snapshot.vat_rate,
    vatRateNumber,
    totals,
  };
}
