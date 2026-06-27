import { pgTable, timestamp, uuid, varchar } from "drizzle-orm/pg-core";
import { departments } from "./departments";
import { offers } from "./offers";
import { tenants } from "./tenants";

export const teams = pgTable("teams", {
  id: uuid("id").primaryKey().defaultRandom(),
  tenantId: uuid("tenant_id")
    .notNull()
    .references(() => tenants.id, { onDelete: "cascade" }),
  departmentId: uuid("department_id")
    .notNull()
    .references(() => departments.id, { onDelete: "cascade" }),
  offerId: uuid("offer_id")
    .notNull()
    .references(() => offers.id, { onDelete: "restrict" }),
  name: varchar("name", { length: 255 }).notNull(),
  ageGroup: varchar("age_group", { length: 64 }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});
