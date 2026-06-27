CREATE UNIQUE INDEX "invoice_line_items_session_enrollment_unique" ON "invoice_line_items" ("tenant_id","session_id","enrollment_id");
