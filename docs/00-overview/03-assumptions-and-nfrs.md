# Assumptions and Non-Functional Requirements

## Purpose

Baseline assumptions for sizing, locale, compliance, and quality attributes.

## Scope

MVP and specification targets.

## Market and locale

| Assumption | Value |
|------------|-------|
| Primary market | DACH (Germany, Austria, Switzerland focus) |
| MVP UI language | German (`de`) |
| i18n | All user-facing strings via keys from day one; English as second locale planned |
| Currency | EUR default per tenant |
| Timezone | Tenant default + per-location override |
| Date/time display | `de-DE` formatting in MVP |

## Tenant scale (MVP NFRs)

| Metric | Target |
|--------|--------|
| Members per tenant | < 500 |
| Staff per tenant | 1–10 |
| Locations per tenant | 1–5 |
| Concurrent staff users | < 20 |
| CRM search latency (p95) | < 300 ms |
| Calendar week view load (p95) | < 500 ms |
| API availability (MVP) | 99.5% monthly (single-server Docker) |

## Data residency

MVP: single EU region deployment (operator choice). Document in env; no multi-region in MVP.

## Security NFRs

- All tenant data queries filtered by `tenant_id` server-side
- Session TTL: staff 8h idle / 30d max; portal 30d max with refresh
- Password policy: min 12 chars (staff); portal may use magic link
- Audit log for all actions in [12-security-privacy/02-audit-log-schema.md](../12-security-privacy/02-audit-log-schema.md)

## Compliance

- GDPR-aligned processes (DSAR export/delete)
- Guardian consent for minors ([05-business-rules/06-guardian-consent-minors.md](../05-business-rules/06-guardian-consent-minors.md))
- German invoice field requirements ([05-business-rules/07-vat-and-invoice-fields-dach.md](../05-business-rules/07-vat-and-invoice-fields-dach.md))

## Household model

Individuals and families treated **equally** in flows: single-member and household paths are first-class.

## Minors

Members under 18 require guardian relationship and consent record before enrollment and portal access.

## Invariants

- NFRs apply to MVP Docker deployment unless ADR states otherwise
- Load tests not required pre-MVP; design for stated scale

## Open questions

Email provider pending ADR-009.
