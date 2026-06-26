import { pgEnum, pgTable, text, timestamp, unique, uuid, varchar } from "drizzle-orm/pg-core";
import { user } from "./auth";

export const platformMembershipStatusEnum = pgEnum("platform_membership_status", [
  "active",
  "removed",
]);

export const platformMemberships = pgTable(
  "platform_memberships",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    role: varchar("role", { length: 64 }).notNull(),
    status: platformMembershipStatusEnum("status").notNull().default("active"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [unique("platform_memberships_user").on(table.userId)],
);
