import { pgEnum, pgTable, text, timestamp, uniqueIndex, uuid } from "drizzle-orm/pg-core";
import { user } from "./auth";
import { sessions } from "./sessions";
import { tenants } from "./tenants";

export const sessionStaffRoleEnum = pgEnum("session_staff_role", ["lead", "assistant"]);

export const sessionStaffAssignments = pgTable(
  "session_staff_assignments",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    tenantId: uuid("tenant_id")
      .notNull()
      .references(() => tenants.id, { onDelete: "cascade" }),
    sessionId: uuid("session_id")
      .notNull()
      .references(() => sessions.id, { onDelete: "cascade" }),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    role: sessionStaffRoleEnum("role").notNull().default("lead"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    uniqueIndex("session_staff_assignments_session_user_unique").on(
      table.sessionId,
      table.userId,
    ),
  ],
);
