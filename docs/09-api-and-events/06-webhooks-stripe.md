# Stripe Webhooks

## Purpose

Platform B2B subscription sync.

## Endpoint

`POST /api/webhooks/stripe` → enqueue JOB-stripe-webhook

## Events handled

| Stripe event | Action |
|--------------|--------|
| customer.subscription.updated | Update ENT-TenantSubscription, sync modules |
| customer.subscription.deleted | Suspend tenant |
| invoice.paid | Platform finance log |
| invoice.payment_failed | Mark past_due, notify |

## Security

Verify `Stripe-Signature` with webhook secret.

## Idempotency

Stripe event id stored; duplicate skip.

## Related

[03-domain-model/07-billing-platform.md](../03-domain-model/07-billing-platform.md)
