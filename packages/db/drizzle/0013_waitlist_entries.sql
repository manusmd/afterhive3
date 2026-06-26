CREATE TYPE "public"."waitlist_entry_status" AS ENUM('waiting', 'offered', 'accepted', 'declined', 'expired', 'removed', 'enrolled');--> statement-breakpoint
CREATE TABLE "waitlist_entries" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"offer_group_id" uuid NOT NULL,
	"member_profile_id" uuid NOT NULL,
	"position" integer NOT NULL,
	"status" "waitlist_entry_status" DEFAULT 'waiting' NOT NULL,
	"requested_at" timestamp with time zone DEFAULT now() NOT NULL,
	"promoted_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "waitlist_entries" ADD CONSTRAINT "waitlist_entries_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "waitlist_entries" ADD CONSTRAINT "waitlist_entries_offer_group_id_offer_groups_id_fk" FOREIGN KEY ("offer_group_id") REFERENCES "public"."offer_groups"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "waitlist_entries" ADD CONSTRAINT "waitlist_entries_member_profile_id_member_profiles_id_fk" FOREIGN KEY ("member_profile_id") REFERENCES "public"."member_profiles"("id") ON DELETE cascade ON UPDATE no action;
