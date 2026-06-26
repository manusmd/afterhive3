# Implementation Order

## Purpose

Phased build aligned to specs and dependency order.

## Phase 0 — Foundations (SETUP-001, EPIC-001, 002, 004, 005)

**Linear:** [SETUP-001 / MAN-211](https://linear.app/manuweb/issue/MAN-211) blocks all Phase 0 epics.

- Turborepo scaffold: `apps/platform`, `apps/admin`, `apps/portal`, `apps/marketplace`, `apps/worker`; packages `db`, `domain`, `api`, `ui`, `shared`
- Docker Compose (four web services + nginx), Drizzle schema base
- Better Auth per app, tenant resolution middleware
- MUI theme shell in each app, i18n keys in `packages/shared`
- Policy engine skeleton

**Verify:** health check green; demo tenant login

## Phase 1 — CRM (EPIC-010, 011, 012, 013, 015)

- Persons, leads, households, relationships
- Conversion, merge, import/export
- Meilisearch persons/leads
- Consent + GDPR flows

**Verify:** US-100–131 pass

## Phase 2 — Offers & scheduling (EPIC-020, 022)

- Offers, groups, recurrence, sessions
- Enrollment, waitlist, capacity
- Calendar UI

**Verify:** US-200–221 pass

## Phase 3 — Club/Sport (EPIC-025)

- Departments, teams, roster, trainers
- Session attendance UI

**Verify:** US-250–251 pass

## Phase 4 — Billing (EPIC-030)

- Tariffs all models, contracts, invoices
- Mock payments, dunning jobs, PDF

**Verify:** US-300–304 pass

## Phase 5 — Comms (EPIC-041, 042)

- Threads, WebSocket, email jobs, templates

**Verify:** US-410–421 pass

## Phase 6 — Portal (EPIC-040)

- Portal surfaces, self-service, privacy

**Verify:** US-400–402 pass

## Phase 7 — Platform ops polish (EPIC-003, 035)

- Impersonation, reports, platform billing Stripe

**Verify:** US-020–021, US-350–352

## Phase 8 — Marketplace (EPIC-050)

- After MVP stable; public indices, booking flow

**Verify:** US-500–501

## Parallel workstreams

- Security/audit: continuous from Phase 0
- Observability: Sentry Phase 0; refine each phase
