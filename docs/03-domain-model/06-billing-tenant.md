# Tenant Billing

## Purpose

Contracts, tariffs, invoices, payments, dunning (tenant → customer).

## Scope

MVP all pricing models; mock payments with Stripe shape.

## Entities

### ENT-Tariff

| Field | Type | Required | Unique | Indexed | Notes |
|-------|------|----------|--------|---------|-------|
| id | UUID | yes | PK | yes | |
| tenant_id | UUID | yes | | yes | |
| name | string | yes | | | |
| model | enum | yes | | | `fixed_monthly`,`per_session`,`package`,`season`,`custom` |
| config | jsonb | yes | | | Model-specific |
| vat_rate | decimal | yes | | | e.g. 0.19 |
| status | enum | yes | | | `active`,`archived` |
| valid_from | date | yes | | | |
| valid_to | date | no | | | |

### ENT-Contract

| Field | Type | Required | Unique | Indexed | Notes |
|-------|------|----------|--------|---------|-------|
| id | UUID | yes | PK | yes | |
| tenant_id | UUID | yes | | yes | |
| customer_profile_id | UUID | yes | | yes | |
| tariff_id | UUID | yes | | | Snapshot ref |
| tariff_snapshot | jsonb | yes | | | Frozen at sign |
| enrollment_id | UUID | no | | | |
| status | enum | yes | | | `draft`,`active`,`paused`,`ended` |
| start_date | date | yes | | | |
| end_date | date | no | | | |
| custom_amount_cents | int | no | | | For custom model |

### ENT-Invoice

| Field | Type | Required | Unique | Indexed | Notes |
|-------|------|----------|--------|---------|-------|
| id | UUID | yes | PK | yes | |
| tenant_id | UUID | yes | | yes | |
| customer_profile_id | UUID | yes | | yes | |
| invoice_number | string | yes | tenant+number | yes | |
| status | enum | yes | | yes | State machine |
| issue_date | date | yes | | | |
| due_date | date | yes | | | |
| service_period_start | date | no | | | Leistungszeitraum |
| service_period_end | date | no | | | |
| net_total_cents | int | yes | | | |
| vat_total_cents | int | yes | | | |
| gross_total_cents | int | yes | | | |
| paid_cents | int | yes | | | |
| currency | string | yes | | | EUR |
| pdf_document_id | UUID | no | | | |

### ENT-InvoiceLineItem

| Field | Type | Required | Unique | Indexed | Notes |
|-------|------|----------|--------|---------|-------|
| id | UUID | yes | PK | yes | |
| tenant_id | UUID | yes | | yes | |
| invoice_id | UUID | yes | | yes | |
| description | string | yes | | | |
| quantity | decimal | yes | | | |
| unit_price_cents | int | yes | | | Net |
| vat_rate | decimal | yes | | | |
| net_cents | int | yes | | | |
| enrollment_id | UUID | no | | | |
| session_id | UUID | no | | | Per-session |

### ENT-PaymentRecord

| Field | Type | Required | Unique | Indexed | Notes |
|-------|------|----------|--------|---------|-------|
| id | UUID | yes | PK | yes | |
| tenant_id | UUID | yes | | yes | |
| invoice_id | UUID | yes | | yes | |
| external_provider | enum | yes | | | `mock`,`stripe`,`manual` |
| external_id | string | no | | | Stripe PI id |
| amount_cents | int | yes | | | |
| currency | string | yes | | | |
| status | enum | yes | | | Stripe-aligned |
| paid_at | timestamptz | no | | | |
| metadata | jsonb | no | | | |

### ENT-DunningCase

| Field | Type | Required | Unique | Indexed | Notes |
|-------|------|----------|--------|---------|-------|
| id | UUID | yes | PK | yes | |
| tenant_id | UUID | yes | | yes | |
| invoice_id | UUID | yes | | yes | |
| stage | int | yes | | | 1,2,3 |
| status | enum | yes | | | `open`,`resolved`,`escalated` |
| next_action_at | timestamptz | yes | | | |

## Relationships

- Contract N:1 CustomerProfile N:1 Person or Household
- Invoice 1:N InvoiceLineItem 1:N PaymentRecord
- Invoice 0:1 DunningCase

## States

[04-state-machines/invoices.md](../04-state-machines/invoices.md), [payments.md](../04-state-machines/payments.md), [dunning.md](../04-state-machines/dunning.md)

## Invariants

- Issued invoice totals immutable; credit notes separate doc post-MVP
- tariff_snapshot on contract never updated after active
- Invoice paid_cents = sum succeeded payments

## Permissions

`tenant_finance`, `tenant_owner`

## API procedures

`PROC-billing.issueInvoiceDraft`, `PROC-billing.issueInvoice`, `PROC-billing.recordMockPayment`

## UI surfaces

`SCR-admin-billing-*`

## Events

`EVT-InvoiceIssued`, `EVT-PaymentRecorded`, `EVT-DunningStageAdvanced`

## Open questions

None.
