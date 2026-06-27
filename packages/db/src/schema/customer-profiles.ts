import { pgTable, timestamp, uniqueIndex, uuid, varchar } from "drizzle-orm/pg-core";
import { persons } from "./persons";
import { tenants } from "./tenants";

export const customerProfiles = pgTable(
  "customer_profiles",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    tenantId: uuid("tenant_id")
      .notNull()
      .references(() => tenants.id, { onDelete: "cascade" }),
    personId: uuid("person_id").references(() => persons.id, { onDelete: "cascade" }),
    customerNumber: varchar("customer_number", { length: 64 }).notNull(),
    status: varchar("status", { length: 32 }).notNull().default("active"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    uniqueIndex("customer_profiles_tenant_number_unique").on(table.tenantId, table.customerNumber),
    uniqueIndex("customer_profiles_tenant_person_unique").on(table.tenantId, table.personId),
  ],
);
