import { and, eq, inArray, lt, sql } from "drizzle-orm";
import { getDb } from "@afterhive/db";
import {
  customerProfiles,
  dunningCases,
  invoices,
  persons,
  user,
} from "@afterhive/db/schema";
import { queueDunningEmail } from "../email/queue-dunning-email";
import { resolveInitialDunningNextActionAt } from "./dunning-schedule";
import { getInvoiceRemainingCents } from "./invoice-payment-status";
import { toIsoDate } from "./invoice-amounts";

export type AdvanceDunningInput = {
  asOfDate?: string;
};

export type AdvanceDunningResult = {
  overdueMarked: number;
  casesCreated: number;
  emailsQueued: number;
  skipped: number;
};

const OVERDUE_ELIGIBLE_STATUSES = ["open", "partially_paid"] as const;

export function isInvoiceOverdue(
  dueDate: string,
  status: string,
  grossTotalCents: number,
  paidCents: number,
  asOfDate: string,
) {
  if (
    !OVERDUE_ELIGIBLE_STATUSES.includes(status as (typeof OVERDUE_ELIGIBLE_STATUSES)[number])
  ) {
    return false;
  }

  if (dueDate >= asOfDate) {
    return false;
  }

  return getInvoiceRemainingCents(grossTotalCents, paidCents) > 0;
}

export async function resolveDunningForInvoice(invoiceId: string, tx: Pick<ReturnType<typeof getDb>, "update">) {
  await tx
    .update(dunningCases)
    .set({ status: "resolved" })
    .where(and(eq(dunningCases.invoiceId, invoiceId), eq(dunningCases.status, "open")));
}

export async function advanceDunning(
  input: AdvanceDunningInput = {},
): Promise<AdvanceDunningResult> {
  const asOfDate = input.asOfDate ?? toIsoDate(new Date());
  const db = getDb();

  const candidates = await db
    .select({
      invoiceId: invoices.id,
      tenantId: invoices.tenantId,
      dueDate: invoices.dueDate,
      status: invoices.status,
      grossTotalCents: invoices.grossTotalCents,
      paidCents: invoices.paidCents,
      recipientEmail: user.email,
    })
    .from(invoices)
    .innerJoin(customerProfiles, eq(invoices.customerProfileId, customerProfiles.id))
    .leftJoin(persons, eq(customerProfiles.personId, persons.id))
    .leftJoin(user, eq(persons.userId, user.id))
    .where(
      and(
        inArray(invoices.status, [...OVERDUE_ELIGIBLE_STATUSES]),
        lt(invoices.dueDate, asOfDate),
        sql`${invoices.paidCents} < ${invoices.grossTotalCents}`,
      ),
    );

  let overdueMarked = 0;
  let casesCreated = 0;
  let emailsQueued = 0;
  let skipped = 0;

  for (const candidate of candidates) {
    const outcome = await db.transaction(async (tx) => {
      const [invoiceRow] = await tx
        .select({
          invoiceId: invoices.id,
          tenantId: invoices.tenantId,
          dueDate: invoices.dueDate,
          status: invoices.status,
          grossTotalCents: invoices.grossTotalCents,
          paidCents: invoices.paidCents,
        })
        .from(invoices)
        .where(eq(invoices.id, candidate.invoiceId))
        .for("update")
        .limit(1);

      if (
        !invoiceRow ||
        !isInvoiceOverdue(
          invoiceRow.dueDate,
          invoiceRow.status,
          invoiceRow.grossTotalCents,
          invoiceRow.paidCents,
          asOfDate,
        )
      ) {
        return "skipped" as const;
      }

      await tx
        .update(invoices)
        .set({ status: "overdue" })
        .where(eq(invoices.id, invoiceRow.invoiceId));

      const [existingCase] = await tx
        .select({ id: dunningCases.id })
        .from(dunningCases)
        .where(eq(dunningCases.invoiceId, invoiceRow.invoiceId))
        .limit(1);

      if (existingCase) {
        return "overdue_only" as const;
      }

      const nextActionAt = new Date(
        `${resolveInitialDunningNextActionAt(invoiceRow.dueDate)}T00:00:00.000Z`,
      );

      const [createdCase] = await tx
        .insert(dunningCases)
        .values({
          tenantId: invoiceRow.tenantId,
          invoiceId: invoiceRow.invoiceId,
          stage: 1,
          status: "open",
          nextActionAt,
        })
        .returning({ id: dunningCases.id });

      if (!createdCase) {
        return "skipped" as const;
      }

      return {
        caseId: createdCase.id,
        recipientEmail: candidate.recipientEmail,
      } as const;
    });

    if (outcome === "skipped") {
      skipped += 1;
      continue;
    }

    overdueMarked += 1;

    if (outcome === "overdue_only") {
      continue;
    }

    casesCreated += 1;

    if (outcome.recipientEmail) {
      await queueDunningEmail({
        tenantId: candidate.tenantId,
        invoiceId: candidate.invoiceId,
        dunningCaseId: outcome.caseId,
        stage: 1,
        recipientEmail: outcome.recipientEmail,
      });
      emailsQueued += 1;
    }
  }

  return { overdueMarked, casesCreated, emailsQueued, skipped };
}
