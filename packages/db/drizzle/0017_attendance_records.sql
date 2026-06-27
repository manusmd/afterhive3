CREATE TYPE "public"."attendance_status" AS ENUM('present', 'absent', 'excused', 'late');--> statement-breakpoint
CREATE TABLE "attendance_records" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"session_id" uuid NOT NULL,
	"member_profile_id" uuid NOT NULL,
	"status" "attendance_status" NOT NULL,
	"recorded_at" timestamp with time zone DEFAULT now() NOT NULL,
	"recorded_by_user_id" text NOT NULL,
	"notes" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "attendance_records" ADD CONSTRAINT "attendance_records_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "attendance_records" ADD CONSTRAINT "attendance_records_session_id_sessions_id_fk" FOREIGN KEY ("session_id") REFERENCES "public"."sessions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "attendance_records" ADD CONSTRAINT "attendance_records_member_profile_id_member_profiles_id_fk" FOREIGN KEY ("member_profile_id") REFERENCES "public"."member_profiles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "attendance_records" ADD CONSTRAINT "attendance_records_recorded_by_user_id_user_id_fk" FOREIGN KEY ("recorded_by_user_id") REFERENCES "public"."user"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "attendance_records_session_member_unique" ON "attendance_records" ("session_id","member_profile_id");
