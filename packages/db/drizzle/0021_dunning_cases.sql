CREATE TYPE "public"."dunning_case_status" AS ENUM('open', 'resolved', 'escalated');
--> statement-breakpoint
CREATE TABLE "dunning_cases" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"invoice_id" uuid NOT NULL,
	"stage" integer DEFAULT 1 NOT NULL,
	"status" "dunning_case_status" DEFAULT 'open' NOT NULL,
	"next_action_at" timestamp with time zone NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "dunning_cases" ADD CONSTRAINT "dunning_cases_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE cascade ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "dunning_cases" ADD CONSTRAINT "dunning_cases_invoice_id_invoices_id_fk" FOREIGN KEY ("invoice_id") REFERENCES "public"."invoices"("id") ON DELETE restrict ON UPDATE no action;
--> statement-breakpoint
CREATE UNIQUE INDEX "dunning_cases_invoice_unique" ON "dunning_cases" USING btree ("invoice_id");
