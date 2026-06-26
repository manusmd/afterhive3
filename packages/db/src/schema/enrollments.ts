import { pgTable, timestamp, uuid, varchar } from "drizzle-orm/pg-core";
import { memberProfiles } from "./member-profiles";
import { offerGroups } from "./offer-groups";
import { tenants } from "./tenants";

export const enrollments = pgTable("enrollments", {
  id: uuid("id").primaryKey().defaultRandom(),
  tenantId: uuid("tenant_id")
    .notNull()
    .references(() => tenants.id, { onDelete: "cascade" }),
  memberProfileId: uuid("member_profile_id")
    .notNull()
    .references(() => memberProfiles.id, { onDelete: "cascade" }),
  offerGroupId: uuid("offer_group_id")
    .notNull()
    .references(() => offerGroups.id, { onDelete: "restrict" }),
  status: varchar("status", { length: 32 }).notNull().default("pending"),
  enrolledAt: timestamp("enrolled_at", { withTimezone: true }).notNull().defaultNow(),
  activatedAt: timestamp("activated_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});
