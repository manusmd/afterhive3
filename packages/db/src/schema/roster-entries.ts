import { sql } from "drizzle-orm";
import { date, pgEnum, pgTable, timestamp, uniqueIndex, uuid, varchar } from "drizzle-orm/pg-core";
import { memberProfiles } from "./member-profiles";
import { teams } from "./teams";
import { tenants } from "./tenants";

export const rosterEntryStatusEnum = pgEnum("roster_entry_status", ["active", "inactive"]);

export const rosterEntries = pgTable(
  "roster_entries",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    tenantId: uuid("tenant_id")
      .notNull()
      .references(() => tenants.id, { onDelete: "cascade" }),
    teamId: uuid("team_id")
      .notNull()
      .references(() => teams.id, { onDelete: "cascade" }),
    memberProfileId: uuid("member_profile_id")
      .notNull()
      .references(() => memberProfiles.id, { onDelete: "cascade" }),
    jerseyNumber: varchar("jersey_number", { length: 16 }),
    status: rosterEntryStatusEnum("status").notNull().default("active"),
    fromDate: date("from_date").notNull(),
    toDate: date("to_date"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    uniqueIndex("roster_entries_team_member_active_unique")
      .on(table.teamId, table.memberProfileId)
      .where(sql`${table.status} = 'active'`),
  ],
);
