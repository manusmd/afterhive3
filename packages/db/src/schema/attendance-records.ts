import { pgEnum, pgTable, text, timestamp, uniqueIndex, uuid } from "drizzle-orm/pg-core";
import { user } from "./auth";
import { memberProfiles } from "./member-profiles";
import { sessions } from "./sessions";
import { tenants } from "./tenants";

export const attendanceStatusEnum = pgEnum("attendance_status", [
  "present",
  "absent",
  "excused",
  "late",
]);

export const attendanceRecords = pgTable(
  "attendance_records",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    tenantId: uuid("tenant_id")
      .notNull()
      .references(() => tenants.id, { onDelete: "cascade" }),
    sessionId: uuid("session_id")
      .notNull()
      .references(() => sessions.id, { onDelete: "cascade" }),
    memberProfileId: uuid("member_profile_id")
      .notNull()
      .references(() => memberProfiles.id, { onDelete: "cascade" }),
    status: attendanceStatusEnum("status").notNull(),
    recordedAt: timestamp("recorded_at", { withTimezone: true }).notNull().defaultNow(),
    recordedByUserId: text("recorded_by_user_id")
      .notNull()
      .references(() => user.id, { onDelete: "restrict" }),
    notes: text("notes"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    uniqueIndex("attendance_records_session_member_unique").on(
      table.sessionId,
      table.memberProfileId,
    ),
  ],
);
