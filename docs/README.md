# Afterhive — Product & Engineering Specification

Complete build specification for Afterhive: multi-tenant SaaS for organizations running recurring programs (sports clubs, tutoring schools, music schools, learning centers).

**Language:** English (active docs). Previous German draft: [`_archive/de-v1/`](_archive/de-v1/).

## Reading order

### For engineers (implementation)

1. [00-overview/](00-overview/) — context, glossary, NFRs, app/repo layout
2. [01-decisions/](01-decisions/) — binding ADRs
3. [03-domain-model/](03-domain-model/) — entities, fields, relationships
4. [04-state-machines/](04-state-machines/) — status workflows
5. [05-business-rules/](05-business-rules/) — executable rules + examples
6. [06-permissions/](06-permissions/) — policy model and matrices
7. [09-api-and-events/](09-api-and-events/) — tRPC, events, jobs, WebSocket
8. [10-data-and-infra/](10-data-and-infra/) — Postgres, Docker, Meilisearch, R2
9. [07-flows/](07-flows/) — end-to-end journeys
10. [08-app-surfaces/](08-app-surfaces/) — routes and screen specs
11. [11-design/](11-design/) — MUI v9 design system
12. [12-security-privacy/](12-security-privacy/) — security, audit, GDPR
13. [13-observability/](13-observability/) — Sentry, logging
14. [14-delivery/](14-delivery/) — MVP scope, epics, stories, AC

### For product / design

1. [02-product/](02-product/) — vision, actors, modules, i18n, DACH
2. [07-flows/](07-flows/)
3. [08-app-surfaces/](08-app-surfaces/)
4. [14-delivery/01-mvp-scope.md](14-delivery/01-mvp-scope.md)

## Locked decisions (summary)

| Area | Decision |
|------|----------|
| MVP vertical | Club/Sport |
| Market | DACH; UI German MVP, i18n-ready |
| Stack | Turborepo, **four Next.js apps** + worker, TS, PostgreSQL, Drizzle, tRPC, Better Auth |
| Surfaces | `apps/platform`, `apps/admin`, `apps/portal`, `apps/marketplace` — no NestJS, no `apps/web` |
| Tenancy | Row-level `tenant_id` |
| Deployment MVP | Docker Compose (own server) |
| Jobs | BullMQ + Redis |
| Search | Meilisearch |
| Storage | Cloudflare R2 |
| UI | Heavily customized MUI v9, dark/light |
| Payments | Stripe-shaped mock (tenant); Stripe B2B (platform) |

## Document template

Domain, API, and screen specs follow: Purpose → Scope → Entities → Relationships → States → Invariants → Permissions → API → UI → Events/Jobs.

## Cross-reference IDs

- **Entities:** `ENT-*` (see [03-domain-model/00-entity-index.md](03-domain-model/00-entity-index.md))
- **Procedures:** `PROC-*` (see [09-api-and-events/02-procedure-catalog.md](09-api-and-events/02-procedure-catalog.md))
- **Screens:** `SCR-*` (see [08-app-surfaces/00-route-map.md](08-app-surfaces/00-route-map.md)) — 72 screens
- **Events:** `EVT-*` (see [09-api-and-events/03-domain-events.md](09-api-and-events/03-domain-events.md))
- **Jobs:** `JOB-*` (see [09-api-and-events/04-background-jobs.md](09-api-and-events/04-background-jobs.md))
- **Epics:** `EPIC-*` (see [14-delivery/02-epics-and-stories.md](14-delivery/02-epics-and-stories.md))

## Traceability

MVP feature coverage audit: [14-delivery/06-traceability-matrix.md](14-delivery/06-traceability-matrix.md)

## Archive

Previous German draft (37 files): [_archive/de-v1/](_archive/de-v1/)
