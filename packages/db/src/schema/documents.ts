import { integer, pgEnum, pgTable, text, timestamp, uuid, varchar } from "drizzle-orm/pg-core";
import { user } from "./auth";
import { tenants } from "./tenants";

export const documentVisibilityEnum = pgEnum("document_visibility", [
  "internal",
  "portal",
  "both",
]);

export const documents = pgTable("documents", {
  id: uuid("id").primaryKey().defaultRandom(),
  tenantId: uuid("tenant_id")
    .notNull()
    .references(() => tenants.id, { onDelete: "cascade" }),
  storageKey: varchar("storage_key", { length: 512 }).notNull(),
  filename: varchar("filename", { length: 255 }).notNull(),
  mimeType: varchar("mime_type", { length: 127 }).notNull(),
  sizeBytes: integer("size_bytes").notNull(),
  sha256: varchar("sha256", { length: 64 }).notNull(),
  linkedEntityType: varchar("linked_entity_type", { length: 64 }),
  linkedEntityId: uuid("linked_entity_id"),
  visibility: documentVisibilityEnum("visibility").notNull().default("internal"),
  uploadedByUserId: text("uploaded_by_user_id")
    .notNull()
    .references(() => user.id, { onDelete: "restrict" }),
  deletedAt: timestamp("deleted_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});
