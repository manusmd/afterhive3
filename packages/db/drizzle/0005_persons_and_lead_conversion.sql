CREATE TABLE "persons" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"first_name" varchar(255) NOT NULL,
	"last_name" varchar(255) NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "persons" ADD CONSTRAINT "persons_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "persons_tenant_id_idx" ON "persons" USING btree ("tenant_id");--> statement-breakpoint
ALTER TABLE "leads" ADD COLUMN "converted_person_id" uuid;--> statement-breakpoint
ALTER TABLE "leads" ADD COLUMN "converted_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "leads" ADD CONSTRAINT "leads_converted_person_id_persons_id_fk" FOREIGN KEY ("converted_person_id") REFERENCES "public"."persons"("id") ON DELETE set null ON UPDATE no action;
