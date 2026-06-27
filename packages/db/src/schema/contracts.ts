import { date, integer, jsonb, pgEnum, pgTable, timestamp, uuid } from "drizzle-orm/pg-core";
import { customerProfiles } from "./customer-profiles";
import { enrollments } from "./enrollments";
import { tariffs } from "./tariffs";
import { tenants } from "./tenants";

export const contractStatusEnum = pgEnum("contract_status", ["draft", "active", "paused", "ended"]);

export const contracts = pgTable("contracts", {
  id: uuid("id").primaryKey().defaultRandom(),
  tenantId: uuid("tenant_id")
    .notNull()
    .references(() => tenants.id, { onDelete: "cascade" }),
  customerProfileId: uuid("customer_profile_id")
    .notNull()
    .references(() => customerProfiles.id, { onDelete: "restrict" }),
  tariffId: uuid("tariff_id")
    .notNull()
    .references(() => tariffs.id, { onDelete: "restrict" }),
  tariffSnapshot: jsonb("tariff_snapshot").notNull(),
  enrollmentId: uuid("enrollment_id").references(() => enrollments.id, { onDelete: "set null" }),
  status: contractStatusEnum("status").notNull().default("draft"),
  startDate: date("start_date").notNull(),
  endDate: date("end_date"),
  customAmountCents: integer("custom_amount_cents"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});
