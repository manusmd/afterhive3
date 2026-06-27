import { integer, jsonb, pgEnum, pgTable, timestamp, uuid, varchar } from "drizzle-orm/pg-core";
import { invoices } from "./invoices";
import { tenants } from "./tenants";

export const paymentProviderEnum = pgEnum("payment_provider", ["mock", "stripe", "manual"]);

export const paymentStatusEnum = pgEnum("payment_status", [
  "requires_payment_method",
  "processing",
  "succeeded",
  "failed",
  "canceled",
  "refunded",
]);

export const paymentRecords = pgTable("payment_records", {
  id: uuid("id").primaryKey().defaultRandom(),
  tenantId: uuid("tenant_id")
    .notNull()
    .references(() => tenants.id, { onDelete: "cascade" }),
  invoiceId: uuid("invoice_id")
    .notNull()
    .references(() => invoices.id, { onDelete: "restrict" }),
  externalProvider: paymentProviderEnum("external_provider").notNull(),
  externalId: varchar("external_id", { length: 255 }),
  amountCents: integer("amount_cents").notNull(),
  currency: varchar("currency", { length: 3 }).notNull().default("EUR"),
  status: paymentStatusEnum("status").notNull().default("requires_payment_method"),
  paidAt: timestamp("paid_at", { withTimezone: true }),
  metadata: jsonb("metadata"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});
