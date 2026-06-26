import {
  integer,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";
import { locations } from "./locations";
import { tenants } from "./tenants";

export const offerTypeEnum = pgEnum("offer_type", [
  "team",
  "course",
  "workshop",
  "subscription",
]);

export const offerVerticalEnum = pgEnum("offer_vertical", ["core", "club_sport"]);

export const offerStatusEnum = pgEnum("offer_status", [
  "draft",
  "internal",
  "published",
  "archived",
]);

export const offers = pgTable("offers", {
  id: uuid("id").primaryKey().defaultRandom(),
  tenantId: uuid("tenant_id")
    .notNull()
    .references(() => tenants.id, { onDelete: "cascade" }),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  type: offerTypeEnum("type").notNull().default("course"),
  vertical: offerVerticalEnum("vertical").notNull().default("core"),
  locationId: uuid("location_id")
    .notNull()
    .references(() => locations.id, { onDelete: "restrict" }),
  status: offerStatusEnum("status").notNull().default("draft"),
  capacityDefault: integer("capacity_default"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});
