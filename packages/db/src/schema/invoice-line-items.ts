import { integer, numeric, pgTable, timestamp, uniqueIndex, uuid, varchar } from "drizzle-orm/pg-core";
import { enrollments } from "./enrollments";
import { invoices } from "./invoices";
import { sessions } from "./sessions";
import { tenants } from "./tenants";

export const invoiceLineItems = pgTable(
  "invoice_line_items",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    tenantId: uuid("tenant_id")
      .notNull()
      .references(() => tenants.id, { onDelete: "cascade" }),
    invoiceId: uuid("invoice_id")
      .notNull()
      .references(() => invoices.id, { onDelete: "cascade" }),
    description: varchar("description", { length: 512 }).notNull(),
    quantity: numeric("quantity", { precision: 10, scale: 2 }).notNull(),
    unitPriceCents: integer("unit_price_cents").notNull(),
    vatRate: numeric("vat_rate", { precision: 5, scale: 4 }).notNull(),
    netCents: integer("net_cents").notNull(),
    enrollmentId: uuid("enrollment_id").references(() => enrollments.id, { onDelete: "set null" }),
    sessionId: uuid("session_id").references(() => sessions.id, { onDelete: "set null" }),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    uniqueIndex("invoice_line_items_session_enrollment_unique").on(
      table.tenantId,
      table.sessionId,
      table.enrollmentId,
    ),
  ],
);
