import {
  boolean,
  jsonb,
  pgEnum,
  pgTable,
  timestamp,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";

export const tenantStatusEnum = pgEnum("tenant_status", [
  "trial",
  "active",
  "suspended",
  "closed",
]);

export const tenants = pgTable("tenants", {
  id: uuid("id").primaryKey().defaultRandom(),
  slug: varchar("slug", { length: 48 }).notNull().unique(),
  name: varchar("name", { length: 255 }).notNull(),
  legalName: varchar("legal_name", { length: 255 }).notNull(),
  status: tenantStatusEnum("status").notNull().default("trial"),
  modules: jsonb("modules").$type<string[]>().notNull().default([]),
  defaultLocale: varchar("default_locale", { length: 8 }).notNull().default("de"),
  timezone: varchar("timezone", { length: 64 }).notNull().default("Europe/Berlin"),
  vatId: varchar("vat_id", { length: 32 }),
  kleinunternehmer: boolean("kleinunternehmer").notNull().default(false),
  settings: jsonb("settings").$type<Record<string, unknown>>().notNull().default({}),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});
