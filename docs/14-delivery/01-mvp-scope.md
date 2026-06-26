# MVP Scope

## Purpose

Explicit in/out boundaries for first shippable product.

## In scope (MVP)

| Area | Includes | Docs |
|------|----------|------|
| Platform ops | Tenant CRUD, modules, Stripe B2B, support, impersonation | EPIC-001–003 |
| Auth | Unified accounts, staff + portal invites | EPIC-002, EPIC-040 |
| Tenancy | Row-level, multi-location | EPIC-004 |
| CRM | Leads, persons, households, merge, import/export | EPIC-010–012 |
| Members | Profiles, enrollment, waitlist | EPIC-020–021 |
| Offers & schedule | Offers, groups, recurrence, sessions, conflicts | EPIC-022–024 |
| Club/Sport | Departments, teams, roster, trainers, attendance | EPIC-025–027 |
| Billing | All 5 tariff models, invoices, mock payment, dunning | EPIC-030–032 |
| Comms | Email + full WebSocket chat | EPIC-041–042 |
| Portal | Self-service profile, requests, schedule, invoices, chat | EPIC-040–043 |
| Documents | Upload, portal visibility, invoice PDFs | EPIC-015 |
| Reports | Basic dashboards + 3 reports | EPIC-035 |
| GDPR | Export, anonymize, guardian consent | EPIC-013 |
| i18n | German MVP, keyed strings | EPIC-005 |

## Out of scope (MVP build)

| Item | Notes |
|------|-------|
| Marketplace implementation | Fully specified; build post-MVP (EPIC-050) |
| Tutoring vertical | Module slot only |
| Real tenant payments (Stripe) | Mock only; shape ready |
| Credit notes | Manual workaround |
| Drag-drop calendar | Form-based scheduling |
| Tournaments/events | Club vertical |
| SSO | Email/password + magic link |
| Mobile native apps | Responsive web only |
| White-label custom domains | Path routing only |
| Advanced reports/BI | Basic only |

## Marketplace

**Specified completely** in docs 03/08/09/07; **implementation** deferred after portal stable.

## Traceability

Every in-scope EPIC links to: entities, procedures, screens, flows, AC in [02-epics-and-stories.md](02-epics-and-stories.md).
