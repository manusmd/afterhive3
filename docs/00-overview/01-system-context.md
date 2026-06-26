# System Context

## Purpose

Afterhive is a multi-tenant platform for organizations that operate recurring programs for children, youth, or adults: sports clubs, tutoring schools, music schools, learning centers, and similar providers. The system supports different business models without building a separate app per industry.

## Scope

MVP and full specification (this document set).

## Core product logic

Shared management of people, relationships, offers, schedules, communication, and billing. Vertical differences sit on top of a stable core. Club/Sport adds departments, teams, rosters, and training attendance; Tutoring (post-MVP vertical slot) would add subjects, learning goals, and progress.

## Architecture pattern

**Core plus verticals.** The core holds CRM, offers, scheduling, documents, communication, and tenant billing. Verticals add domain-specific fields, processes, and UI without parallel identity models.

## App surfaces

Four **separate Next.js apps** (not one monolithic web app). Shared backend in `packages/*`; no NestJS.

| Surface | App | Route prefix | Primary users |
|---------|-----|--------------|---------------|
| Platform backoffice | `apps/platform` | `/platform/*` | Afterhive staff |
| Tenant admin | `apps/admin` | `/app/:tenantSlug/*` | Organization staff |
| Self-service portal | `apps/portal` | `/portal/:tenantSlug/*` | Members, parents, payers |
| Marketplace | `apps/marketplace` | `/discover/*` | Public visitors |

Detail: [04-app-surfaces-and-repo.md](04-app-surfaces-and-repo.md).

## Member-centric design

The **Member** is the central product entity—not the course, team, or invoice. Architecture, data model, permissions, and UX derive from people in context: relationships, programs, contracts, communication, and history.

## External systems (MVP)

- PostgreSQL (primary data)
- Redis + BullMQ (async jobs)
- Meilisearch (search)
- Cloudflare R2 (documents)
- Stripe (platform B2B subscriptions; tenant payment shape for future)
- Sentry (errors)
- Transactional email (provider TBD — see ADR-009)

## Relationships

See [03-domain-model/diagrams/core-er.mmd](03-domain-model/diagrams/core-er.mmd).

## Open questions

None at system context level.
