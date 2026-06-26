# Platform Billing

## Purpose

Afterhive subscription billing for tenants (Stripe B2B).

## Scope

MVP platform backoffice + Stripe webhooks.

## Entities

### ENT-TenantSubscription

| Field | Type | Required | Unique | Indexed | Notes |
|-------|------|----------|--------|---------|-------|
| id | UUID | yes | PK | yes | |
| tenant_id | UUID | yes | unique | yes | One active |
| stripe_customer_id | string | yes | | yes | |
| stripe_subscription_id | string | no | | yes | |
| plan_id | string | yes | | | Platform plan |
| status | enum | yes | | yes | `trialing`,`active`,`past_due`,`canceled` |
| current_period_end | timestamptz | no | | | |
| modules_entitled | jsonb | yes | | | Sync to Tenant.modules |

Platform table: no tenant_id column on subscription uses tenant_id as FK only.

## Relationships

- TenantSubscription 1:1 Tenant

## Invariants

- Tenant.modules must match modules_entitled when subscription active
- Suspend tenant on `past_due` after grace period (configurable, default 14 days)

## Permissions

`platform_finance`, `platform_superadmin`

## API procedures

`PROC-platform.createSubscription`, webhook handlers

## UI surfaces

`SCR-platform-tenant-billing`

## Events

`EVT-TenantSubscriptionUpdated`

## Open questions

None.
