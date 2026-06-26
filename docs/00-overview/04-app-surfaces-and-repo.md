# App Surfaces and Monorepo Layout

## Purpose

Define how the four product surfaces map to deployable Next.js apps and shared packages. There is **no NestJS** and **no single `apps/web`** — each surface is its own Next.js application.

## Surfaces → apps

| Surface | App | Audience | Primary routes (MVP) |
|---------|-----|----------|----------------------|
| Platform backoffice | `apps/platform` | Afterhive staff | `/platform/*` |
| Tenant admin | `apps/admin` | Club staff | `/app/:tenantSlug/*` |
| Self-service portal | `apps/portal` | Members, guardians | `/portal/:tenantSlug/*` |
| Public marketplace | `apps/marketplace` | Anonymous + logged-in discover | `/discover/*` |

Each app has its own layout shell, navigation, permission context, and login entry. They share one PostgreSQL database, one auth user model, and one set of domain packages.

## Monorepo layout

```
apps/
  platform/      # Next.js — platform backoffice
  admin/         # Next.js — tenant admin (incl. WebSocket chat server route)
  portal/        # Next.js — member/guardian portal (incl. WebSocket chat)
  marketplace/   # Next.js — public discovery + booking handoff
  worker/        # Node — BullMQ job processor (not Next.js)
packages/
  db/            # Drizzle schema, migrations, client
  domain/        # Entities, state machines, business rules
  api/           # tRPC routers + shared context (all surfaces)
  ui/            # MUI v9 shared components, theme tokens
  shared/        # Zod schemas, constants, i18n message catalogs
```

## Shared backend (no separate API server)

Business logic lives in `packages/api` and `packages/domain`. Each Next.js app exposes only the tRPC routers its surface needs via a local `/api/trpc` route handler.

| App | Mounted tRPC namespaces |
|-----|-------------------------|
| `apps/platform` | `platform.*` |
| `apps/admin` | `tenant.*` |
| `apps/portal` | `portal.*` |
| `apps/marketplace` | `marketplace.*` (public + optional session) |

Cross-cutting procedures (health, session introspection) may be duplicated in thin wrappers per app or shared via a small `packages/api/server` helper.

## Auth

Better Auth runs in each app that requires login. Session cookies are scoped per app origin (path-based MVP) or subdomain (post-MVP). One `users` table; membership and roles resolved per tenant in middleware. See [ADR-003](../01-decisions/003-auth-better-auth.md).

## Real-time chat

WebSocket endpoint is implemented as a Next.js Route Handler (or custom server hook) on **`apps/admin`** and **`apps/portal`** only. Platform and marketplace do not expose chat sockets in MVP.

## Deployment (MVP)

Four Next.js containers behind nginx (or Caddy) on one host. See [Docker Compose topology](../10-data-and-infra/05-docker-compose-topology.md) and [ADR-002](../01-decisions/002-deployment-docker.md).

Example path routing (nginx → container):

| Path prefix | Service |
|-------------|---------|
| `/platform/*` | `platform:3001` |
| `/app/*` | `admin:3002` |
| `/portal/*` | `portal:3003` |
| `/discover/*` | `marketplace:3004` |

Post-MVP: subdomain per surface (`admin.{tenant}.afterhive.de`, etc.) — [ADR-010](../01-decisions/010-routing-path-to-subdomain.md).

## Why not NestJS

See [ADR-013](../01-decisions/013-no-nestjs.md). Summary: tRPC + Next.js route handlers + shared packages give typed end-to-end APIs without a second server framework.

## Related docs

- [System context](01-system-context.md)
- [Route map](../08-app-surfaces/00-route-map.md)
- [Screen specs](../08-app-surfaces/)
- [Procedure catalog](../09-api-and-events/02-procedure-catalog.md)
