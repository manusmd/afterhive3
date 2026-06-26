import { integer, pgTable, timestamp, uuid, varchar } from "drizzle-orm/pg-core";
import { offerGroups } from "./offer-groups";
import { tenants } from "./tenants";

export const recurrenceRules = pgTable("recurrence_rules", {
  id: uuid("id").primaryKey().defaultRandom(),
  tenantId: uuid("tenant_id")
    .notNull()
    .references(() => tenants.id, { onDelete: "cascade" }),
  offerGroupId: uuid("offer_group_id")
    .notNull()
    .references(() => offerGroups.id, { onDelete: "cascade" }),
  rrule: varchar("rrule", { length: 512 }).notNull(),
  timezone: varchar("timezone", { length: 64 }).notNull(),
  dtstart: timestamp("dtstart", { withTimezone: true }).notNull(),
  until: timestamp("until", { withTimezone: true }),
  durationMinutes: integer("duration_minutes").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});
