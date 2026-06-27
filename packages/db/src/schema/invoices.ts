import { date, integer, pgEnum, pgTable, timestamp, uniqueIndex, uuid, varchar } from "drizzle-orm/pg-core";
import { contracts } from "./contracts";
import { customerProfiles } from "./customer-profiles";
import { tenants } from "./tenants";

export const invoiceStatusEnum = pgEnum("invoice_status", [
  "draft",
  "issued",
  "open",
  "partially_paid",
  "paid",
  "overdue",
  "canceled",
  "void",
]);

export const invoices = pgTable(
  "invoices",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    tenantId: uuid("tenant_id")
      .notNull()
      .references(() => tenants.id, { onDelete: "cascade" }),
    customerProfileId: uuid("customer_profile_id")
      .notNull()
      .references(() => customerProfiles.id, { onDelete: "restrict" }),
    contractId: uuid("contract_id")
      .notNull()
      .references(() => contracts.id, { onDelete: "restrict" }),
    invoiceNumber: varchar("invoice_number", { length: 64 }).notNull(),
    status: invoiceStatusEnum("status").notNull().default("draft"),
    issueDate: date("issue_date").notNull(),
    dueDate: date("due_date").notNull(),
    servicePeriodStart: date("service_period_start"),
    servicePeriodEnd: date("service_period_end"),
    netTotalCents: integer("net_total_cents").notNull(),
    vatTotalCents: integer("vat_total_cents").notNull(),
    grossTotalCents: integer("gross_total_cents").notNull(),
    paidCents: integer("paid_cents").notNull().default(0),
    currency: varchar("currency", { length: 3 }).notNull().default("EUR"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    uniqueIndex("invoices_tenant_number_unique").on(table.tenantId, table.invoiceNumber),
    uniqueIndex("invoices_tenant_contract_period_unique").on(
      table.tenantId,
      table.contractId,
      table.servicePeriodStart,
      table.servicePeriodEnd,
    ),
  ],
);
