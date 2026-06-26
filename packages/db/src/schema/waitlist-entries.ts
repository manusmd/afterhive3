import { integer, pgEnum, pgTable, timestamp, uuid } from "drizzle-orm/pg-core";
import { memberProfiles } from "./member-profiles";
import { offerGroups } from "./offer-groups";
import { tenants } from "./tenants";

export const waitlistEntryStatusEnum = pgEnum("waitlist_entry_status", [
  "waiting",
  "offered",
  "accepted",
  "declined",
  "expired",
  "removed",
  "enrolled",
]);

export const waitlistEntries = pgTable("waitlist_entries", {
  id: uuid("id").primaryKey().defaultRandom(),
  tenantId: uuid("tenant_id")
    .notNull()
    .references(() => tenants.id, { onDelete: "cascade" }),
  offerGroupId: uuid("offer_group_id")
    .notNull()
    .references(() => offerGroups.id, { onDelete: "cascade" }),
  memberProfileId: uuid("member_profile_id")
    .notNull()
    .references(() => memberProfiles.id, { onDelete: "cascade" }),
  position: integer("position").notNull(),
  status: waitlistEntryStatusEnum("status").notNull().default("waiting"),
  requestedAt: timestamp("requested_at", { withTimezone: true }).notNull().defaultNow(),
  promotedAt: timestamp("promoted_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});
