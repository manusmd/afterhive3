import { boolean, pgTable, timestamp, unique, uuid, varchar } from "drizzle-orm/pg-core";
import { persons } from "./persons";
import { tenants } from "./tenants";

export const relationships = pgTable(
  "relationships",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    tenantId: uuid("tenant_id")
      .notNull()
      .references(() => tenants.id, { onDelete: "cascade" }),
    fromPersonId: uuid("from_person_id")
      .notNull()
      .references(() => persons.id, { onDelete: "cascade" }),
    toPersonId: uuid("to_person_id")
      .notNull()
      .references(() => persons.id, { onDelete: "cascade" }),
    type: varchar("type", { length: 32 }).notNull(),
    isPrimaryGuardian: boolean("is_primary_guardian").notNull().default(false),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    unique("relationships_tenant_from_to_type").on(
      table.tenantId,
      table.fromPersonId,
      table.toPersonId,
      table.type,
    ),
  ],
);
