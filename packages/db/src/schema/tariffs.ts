import { date, jsonb, numeric, pgEnum, pgTable, timestamp, uuid, varchar } from "drizzle-orm/pg-core";
import { tenants } from "./tenants";

export const tariffModelEnum = pgEnum("tariff_model", [
  "fixed_monthly",
  "per_session",
  "package",
  "season",
  "custom",
]);

export const tariffStatusEnum = pgEnum("tariff_status", ["active", "archived"]);

export const tariffs = pgTable("tariffs", {
  id: uuid("id").primaryKey().defaultRandom(),
  tenantId: uuid("tenant_id")
    .notNull()
    .references(() => tenants.id, { onDelete: "cascade" }),
  name: varchar("name", { length: 255 }).notNull(),
  model: tariffModelEnum("model").notNull(),
  config: jsonb("config").notNull(),
  vatRate: numeric("vat_rate", { precision: 5, scale: 4 }).notNull(),
  status: tariffStatusEnum("status").notNull().default("active"),
  validFrom: date("valid_from").notNull(),
  validTo: date("valid_to"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});
