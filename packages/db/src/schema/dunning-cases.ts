import { integer, pgEnum, pgTable, timestamp, uniqueIndex, uuid } from "drizzle-orm/pg-core";
import { invoices } from "./invoices";
import { tenants } from "./tenants";

export const dunningCaseStatusEnum = pgEnum("dunning_case_status", ["open", "resolved", "escalated"]);

export const dunningCases = pgTable(
  "dunning_cases",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    tenantId: uuid("tenant_id")
      .notNull()
      .references(() => tenants.id, { onDelete: "cascade" }),
    invoiceId: uuid("invoice_id")
      .notNull()
      .references(() => invoices.id, { onDelete: "restrict" }),
    stage: integer("stage").notNull().default(1),
    status: dunningCaseStatusEnum("status").notNull().default("open"),
    nextActionAt: timestamp("next_action_at", { withTimezone: true }).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [uniqueIndex("dunning_cases_invoice_unique").on(table.invoiceId)],
);
