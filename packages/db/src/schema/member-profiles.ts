import { pgTable, timestamp, uuid, varchar } from "drizzle-orm/pg-core";
import { persons } from "./persons";
import { tenants } from "./tenants";

export const memberProfiles = pgTable("member_profiles", {
  id: uuid("id").primaryKey().defaultRandom(),
  tenantId: uuid("tenant_id")
    .notNull()
    .references(() => tenants.id, { onDelete: "cascade" }),
  personId: uuid("person_id")
    .notNull()
    .references(() => persons.id, { onDelete: "cascade" }),
  memberNumber: varchar("member_number", { length: 64 }).notNull(),
  status: varchar("status", { length: 32 }).notNull().default("prospect"),
  consentStatus: varchar("consent_status", { length: 32 }).notNull().default("pending"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});
