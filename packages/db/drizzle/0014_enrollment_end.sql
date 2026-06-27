CREATE TYPE "public"."enrollment_end_reason" AS ENUM('completed', 'canceled', 'transferred');--> statement-breakpoint
ALTER TABLE "enrollments" ADD COLUMN "ended_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "enrollments" ADD COLUMN "end_reason" "enrollment_end_reason";
