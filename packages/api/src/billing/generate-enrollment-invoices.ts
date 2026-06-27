import { and, eq, isNotNull, sql } from "drizzle-orm";
import { getDb } from "@afterhive/db";
import { contracts, invoiceLineItems, invoices } from "@afterhive/db/schema";
import {
  addDays,
  buildInvoiceNumber,
  calculateAmountsFromNet,
  parseVatRate,
} from "./invoice-amounts";
import {
  buildPackageDescription,
  buildSeasonDescription,
  resolvePackageNetCents,
  resolveSeasonNetCents,
} from "./contract-billing-amounts";
import { parsePackageConfig, parseSeasonConfig, parseTariffSnapshot } from "./tariff-snapshot";

export type GeneratedEnrollmentInvoice = {
  invoiceId: string;
  contractId: string;
  invoiceNumber: string;
  netTotalCents: number;
  vatTotalCents: number;
  grossTotalCents: number;
};

export type GenerateEnrollmentInvoicesResult = {
  created: GeneratedEnrollmentInvoice[];
  skipped: number;
};

const PAYMENT_TERMS_DAYS = 14;

export async function generateEnrollmentInvoices(): Promise<GenerateEnrollmentInvoicesResult> {
  const db = getDb();
  const activeContracts = await db
    .select({
      contractId: contracts.id,
      tenantId: contracts.tenantId,
      customerProfileId: contracts.customerProfileId,
      enrollmentId: contracts.enrollmentId,
      tariffSnapshot: contracts.tariffSnapshot,
      startDate: contracts.startDate,
    })
    .from(contracts)
    .where(and(eq(contracts.status, "active"), isNotNull(contracts.enrollmentId)));

  const created: GeneratedEnrollmentInvoice[] = [];
  let skipped = 0;

  for (const contract of activeContracts) {
    const snapshot = parseTariffSnapshot(contract.tariffSnapshot);

    if (!snapshot || (snapshot.model !== "package" && snapshot.model !== "season")) {
      skipped += 1;
      continue;
    }

    const vatRate = parseVatRate(snapshot.vat_rate);

    if (vatRate === null) {
      skipped += 1;
      continue;
    }

    let netCents: number | null = null;
    let servicePeriodStart = contract.startDate;
    let servicePeriodEnd = contract.startDate;
    let description = snapshot.name;
    let unitPriceCents = 0;

    if (snapshot.model === "package") {
      const config = parsePackageConfig(snapshot.config);

      if (!config) {
        skipped += 1;
        continue;
      }

      netCents = resolvePackageNetCents(config.amount_cents);
      servicePeriodEnd = addDays(contract.startDate, config.valid_days - 1);
      description = buildPackageDescription(snapshot.name, config.sessions_included);
      unitPriceCents = config.amount_cents;
    } else {
      const config = parseSeasonConfig(snapshot.config);

      if (!config) {
        skipped += 1;
        continue;
      }

      netCents = resolveSeasonNetCents(
        config.amount_cents,
        config.season_start,
        config.season_end,
        contract.startDate,
      );
      servicePeriodStart = config.season_start;
      servicePeriodEnd = config.season_end;
      description = buildSeasonDescription(snapshot.name, config.season_start, config.season_end);
      unitPriceCents = netCents;
    }

    if (netCents === null || netCents <= 0) {
      skipped += 1;
      continue;
    }

    const issueDate = contract.startDate;
    const dueDate = addDays(issueDate, PAYMENT_TERMS_DAYS);
    const totals = calculateAmountsFromNet(netCents, vatRate);

    const invoice = await db.transaction(async (tx) => {
      const [existing] = await tx
        .select({ id: invoices.id })
        .from(invoices)
        .where(eq(invoices.contractId, contract.contractId))
        .limit(1);

      if (existing) {
        return null;
      }

      const issueYear = Number(issueDate.slice(0, 4));

      const [countRow] = await tx
        .select({ count: sql<number>`count(*)::int` })
        .from(invoices)
        .where(
          and(
            eq(invoices.tenantId, contract.tenantId),
            sql`extract(year from ${invoices.issueDate}) = ${issueYear}`,
          ),
        );

      const invoiceNumber = buildInvoiceNumber(issueYear, (countRow?.count ?? 0) + 1);

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
        unitPriceCents,
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
