import { pgTable, timestamp, uuid, varchar } from "drizzle-orm/pg-core";
import { locations } from "./locations";
import { persons } from "./persons";
import { tenants } from "./tenants";

export const leads = pgTable("leads", {
  id: uuid("id").primaryKey().defaultRandom(),
  tenantId: uuid("tenant_id")
    .notNull()
    .references(() => tenants.id, { onDelete: "cascade" }),
  locationId: uuid("location_id")
    .notNull()
    .references(() => locations.id, { onDelete: "restrict" }),
  firstName: varchar("first_name", { length: 255 }).notNull(),
  lastName: varchar("last_name", { length: 255 }).notNull(),
  status: varchar("status", { length: 32 }).notNull().default("new"),
  source: varchar("source", { length: 32 }).notNull().default("manual"),
  convertedPersonId: uuid("converted_person_id").references(() => persons.id, {
    onDelete: "set null",
  }),
  convertedAt: timestamp("converted_at", { withTimezone: true }),
  lastActivityAt: timestamp("last_activity_at", { withTimezone: true }).notNull().defaultNow(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});
