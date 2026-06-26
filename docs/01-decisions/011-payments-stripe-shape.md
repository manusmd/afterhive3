# ADR-011: Payments — Stripe-Shaped Records

## Status

Accepted

## Context

MVP billing is modeled with mock/manual payments; future real payments should not require schema rewrite.

## Decision

### Tenant → member billing (MVP mock)

- `ENT-PaymentRecord` fields align with Stripe PaymentIntent + Charge subset:
  - `external_provider`: `mock` | `stripe` | `manual`
  - `external_id`: nullable Stripe ID
  - `amount_cents`, `currency`, `status`: `requires_payment_method` | `processing` | `succeeded` | `failed` | `canceled` | `refunded`
  - `metadata` JSON for reconciliation

### Platform → tenant billing (MVP real)

- **Stripe Billing** for tenant subscriptions to Afterhive
- Webhooks: [09-api-and-events/06-webhooks-stripe.md](../09-api-and-events/06-webhooks-stripe.md)
- Separate tables: `ENT-TenantSubscription` (platform scope)

## Consequences

- Invoice paid transition accepts mock `PROC-billing.recordMockPayment` or Stripe webhook
- Never mix platform and tenant payment tables

## Related

- [03-domain-model/06-billing-tenant.md](../03-domain-model/06-billing-tenant.md)
- [03-domain-model/07-billing-platform.md](../03-domain-model/07-billing-platform.md)
