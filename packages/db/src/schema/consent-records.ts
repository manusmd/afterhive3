import { boolean, pgTable, timestamp, uuid, varchar } from "drizzle-orm/pg-core";
import { persons } from "./persons";
import { tenants } from "./tenants";

export const consentRecords = pgTable("consent_records", {
  id: uuid("id").primaryKey().defaultRandom(),
  tenantId: uuid("tenant_id")
    .notNull()
    .references(() => tenants.id, { onDelete: "cascade" }),
  personId: uuid("person_id")
    .notNull()
    .references(() => persons.id, { onDelete: "cascade" }),
  guardianPersonId: uuid("guardian_person_id")
    .notNull()
    .references(() => persons.id, { onDelete: "cascade" }),
  type: varchar("type", { length: 32 }).notNull(),
  granted: boolean("granted").notNull(),
  grantedAt: timestamp("granted_at", { withTimezone: true }).notNull(),
  method: varchar("method", { length: 32 }).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});
