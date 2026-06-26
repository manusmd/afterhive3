# ADR-009: Transactional Email Provider

## Status

**Pending decision** — options documented; **Resend recommended**

## Context

Transactional email: invites, invoices, dunning, portal notifications. DACH deliverability matters.

## Options

| Provider | Pros | Cons |
|----------|------|------|
| **Resend (recommended)** | Simple API, good DX, React Email friendly | Newer in EU enterprise procurement |
| Postmark | Strong deliverability reputation | Slightly higher cost |
| Amazon SES | Cheap at scale | More setup (DNS, sandbox) |
| Mailgun | Mature | EU region config needed |

## Recommendation

**Resend** for MVP: fast integration, webhooks for bounces, fits Docker MVP.

## Decision criteria (when locking)

- EU data processing agreement
- Bounce/complaint webhooks → `ENT-DeliveryAttempt`
- Template versioning support
- Cost at <10k emails/month

## Interim

Spec assumes abstract `EmailProvider` interface; implement Resend adapter unless overridden.

## Related

- [03-domain-model/08-communications.md](../03-domain-model/08-communications.md)
