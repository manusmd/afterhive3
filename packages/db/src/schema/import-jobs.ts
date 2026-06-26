import { jsonb, pgEnum, pgTable, text, timestamp, uuid, varchar } from "drizzle-orm/pg-core";
import { tenants } from "./tenants";

export const importEntityTypeEnum = pgEnum("import_entity_type", ["lead", "person"]);

export const importJobStatusEnum = pgEnum("import_job_status", [
  "pending",
  "processing",
  "completed",
  "failed",
]);

export type ImportJobResult = {
  imported: number;
  failed: number;
  errors: Array<{ row: number; message: string }>;
};

export const importJobs = pgTable("import_jobs", {
  id: uuid("id").primaryKey().defaultRandom(),
  tenantId: uuid("tenant_id")
    .notNull()
    .references(() => tenants.id, { onDelete: "cascade" }),
  entityType: importEntityTypeEnum("entity_type").notNull(),
  status: importJobStatusEnum("status").notNull().default("pending"),
  fileName: varchar("file_name", { length: 255 }),
  mapping: jsonb("mapping").$type<Record<string, string>>().notNull(),
  result: jsonb("result").$type<ImportJobResult>(),
  createdByUserId: uuid("created_by_user_id").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  completedAt: timestamp("completed_at", { withTimezone: true }),
});
