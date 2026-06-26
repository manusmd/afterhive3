CREATE TYPE "public"."offer_type" AS ENUM('team', 'course', 'workshop', 'subscription');--> statement-breakpoint
CREATE TYPE "public"."offer_vertical" AS ENUM('core', 'club_sport');--> statement-breakpoint
CREATE TYPE "public"."offer_status" AS ENUM('draft', 'internal', 'published', 'archived');--> statement-breakpoint
CREATE TYPE "public"."offer_group_status" AS ENUM('draft', 'open', 'full', 'closed');--> statement-breakpoint
CREATE TYPE "public"."session_status" AS ENUM('scheduled', 'in_progress', 'completed', 'canceled');--> statement-breakpoint
CREATE TABLE "offers" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"name" varchar(255) NOT NULL,
	"description" text,
	"type" "offer_type" DEFAULT 'course' NOT NULL,
	"vertical" "offer_vertical" DEFAULT 'core' NOT NULL,
	"location_id" uuid NOT NULL,
	"status" "offer_status" DEFAULT 'draft' NOT NULL,
	"capacity_default" integer,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "offers" ADD CONSTRAINT "offers_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "offers" ADD CONSTRAINT "offers_location_id_locations_id_fk" FOREIGN KEY ("location_id") REFERENCES "public"."locations"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "offer_groups" ADD COLUMN "offer_id" uuid;--> statement-breakpoint
ALTER TABLE "offer_groups" ADD COLUMN "capacity" integer;--> statement-breakpoint
ALTER TABLE "offer_groups" ADD COLUMN "enrolled_count" integer DEFAULT 0;--> statement-breakpoint
ALTER TABLE "offer_groups" ADD COLUMN "waitlist_enabled" boolean DEFAULT false;--> statement-breakpoint
ALTER TABLE "offer_groups" ADD COLUMN "location_id" uuid;--> statement-breakpoint
ALTER TABLE "offer_groups" ADD COLUMN "status" "offer_group_status" DEFAULT 'open';--> statement-breakpoint
DO $$
DECLARE
  group_row RECORD;
  new_offer_id uuid;
  v_location_id uuid;
  v_enrolled_count integer;
BEGIN
  FOR group_row IN SELECT id, tenant_id, name FROM offer_groups LOOP
    SELECT l.id INTO v_location_id
    FROM locations l
    WHERE l.tenant_id = group_row.tenant_id
    ORDER BY l.created_at ASC
    LIMIT 1;

    IF v_location_id IS NULL THEN
      RAISE EXCEPTION 'Cannot backfill offer_group %: tenant has no location', group_row.id;
    END IF;

    SELECT COUNT(*) INTO v_enrolled_count
    FROM enrollments e
    WHERE e.offer_group_id = group_row.id
      AND e.status = 'active';

    new_offer_id := gen_random_uuid();

    INSERT INTO offers (
      id,
      tenant_id,
      name,
      location_id,
      type,
      vertical,
      status,
      capacity_default
    ) VALUES (
      new_offer_id,
      group_row.tenant_id,
      group_row.name,
      v_location_id,
      'course',
      'core',
      'draft',
      20
    );

    UPDATE offer_groups
    SET
      offer_id = new_offer_id,
      capacity = 20,
      enrolled_count = v_enrolled_count,
      waitlist_enabled = false,
      location_id = v_location_id,
      status = 'open'
    WHERE id = group_row.id;
  END LOOP;
END $$;--> statement-breakpoint
ALTER TABLE "offer_groups" ALTER COLUMN "offer_id" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "offer_groups" ALTER COLUMN "capacity" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "offer_groups" ALTER COLUMN "enrolled_count" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "offer_groups" ALTER COLUMN "waitlist_enabled" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "offer_groups" ALTER COLUMN "location_id" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "offer_groups" ALTER COLUMN "status" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "offer_groups" ADD CONSTRAINT "offer_groups_offer_id_offers_id_fk" FOREIGN KEY ("offer_id") REFERENCES "public"."offers"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "offer_groups" ADD CONSTRAINT "offer_groups_location_id_locations_id_fk" FOREIGN KEY ("location_id") REFERENCES "public"."locations"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
CREATE TABLE "recurrence_rules" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"offer_group_id" uuid NOT NULL,
	"rrule" varchar(512) NOT NULL,
	"timezone" varchar(64) NOT NULL,
	"dtstart" timestamp with time zone NOT NULL,
	"until" timestamp with time zone,
	"duration_minutes" integer NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "recurrence_rules" ADD CONSTRAINT "recurrence_rules_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "recurrence_rules" ADD CONSTRAINT "recurrence_rules_offer_group_id_offer_groups_id_fk" FOREIGN KEY ("offer_group_id") REFERENCES "public"."offer_groups"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE TABLE "sessions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"offer_group_id" uuid NOT NULL,
	"location_id" uuid NOT NULL,
	"starts_at" timestamp with time zone NOT NULL,
	"ends_at" timestamp with time zone NOT NULL,
	"status" "session_status" DEFAULT 'scheduled' NOT NULL,
	"title" varchar(255),
	"cancellation_reason" text,
	"notes" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "sessions" ADD CONSTRAINT "sessions_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sessions" ADD CONSTRAINT "sessions_offer_group_id_offer_groups_id_fk" FOREIGN KEY ("offer_group_id") REFERENCES "public"."offer_groups"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sessions" ADD CONSTRAINT "sessions_location_id_locations_id_fk" FOREIGN KEY ("location_id") REFERENCES "public"."locations"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "sessions_offer_group_id_starts_at_unique" ON "sessions" ("offer_group_id", "starts_at");
