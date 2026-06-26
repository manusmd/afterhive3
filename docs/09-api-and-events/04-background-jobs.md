# Background Jobs

## Purpose

BullMQ job catalog (JOB-*).

## Queues

`default`, `email`, `billing`, `search`, `imports`, `webhooks`

## Jobs

| ID | Queue | Trigger | Handler summary | Retry |
|----|-------|---------|-----------------|-------|
| JOB-email-send | email | EVT-*, invite | Render template, DeliveryAttempt, provider send | 3 |
| JOB-generate-invoice-pdf | billing | EVT-InvoiceIssued | Render PDF, R2 upload | 3 |
| JOB-generate-sessions | default | recurrence/manual | Expand RRULE to Session rows | 3 |
| JOB-recurring-invoices | billing | cron daily | PROC-billing.generateRecurringInvoices | 1 |
| JOB-dunning-advance | billing | cron daily | Overdue check, stage advance | 1 |
| JOB-search-upsert | search | domain events | Meilisearch add/update | 5 |
| JOB-search-delete | search | delete events | Meilisearch delete | 5 |
| JOB-import-process | imports | PROC-crm.importCsv | Parse CSV rows | 1 |
| JOB-gdpr-export | default | PROC-gdpr.export | Build zip | 2 |
| JOB-stripe-webhook | webhooks | HTTP | Verify signature, update subscription | 5 |
| JOB-meilisearch-reindex | search | manual | Full tenant reindex | 1 |
| JOB-waitlist-expire | default | cron hourly | Expire offered entries | 1 |
| JOB-session-reminder | email | cron hourly | 24h session email | 3 |
| JOB-booking-notify | email | EVT-BookingRequestSubmitted | Notify tenant office | 3 |
| JOB-attendance-billing-batch | billing | weekly | Per-session invoice lines | 2 |

## Idempotency

Job ID = `{jobName}:{entityId}:{version}` where applicable.

## Dead letter

After max retries → `failed_jobs` table + Sentry alert.

## Cron

Worker process runs schedulers via BullMQ repeatable jobs.
