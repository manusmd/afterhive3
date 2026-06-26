# ADR-013: No NestJS — Next.js Apps + Shared Packages

## Status

Accepted

## Context

Afterhive has four distinct UI surfaces with separate auth entry points, layouts, and permission models. A common pattern is a NestJS (or Express) API layer plus one or more frontends.

## Decision

**Do not use NestJS.** Backend capabilities are implemented as:

1. **Shared packages** — `packages/domain`, `packages/api` (tRPC routers), `packages/db`
2. **Next.js route handlers** — each surface app mounts `/api/trpc` with its router subset
3. **`apps/worker`** — standalone Node process for BullMQ (not a web framework)

## Rationale

- **End-to-end types** — tRPC from `packages/api` to each Next.js client without duplicating OpenAPI/DTO layers
- **One language and repo** — Turborepo already coordinates build/test; no second deployment unit for “the API”
- **Surface isolation** — four apps enforce boundary at deploy and bundle level; NestJS would still require the same router splitting
- **Operational simplicity** — Docker Compose runs four Next.js services + worker + Postgres/Redis; no NestJS process to monitor separately

## Consequences

- WebSocket chat uses Next.js (admin + portal), not a NestJS gateway
- Long-running or heavy jobs stay in BullMQ worker, not request handlers
- If a non-HTTP integration later needs a dedicated service, prefer a small focused Node script or worker job, not a full NestJS app

## Related

- [ADR-001 Stack and repo](./001-stack-and-repo.md)
- [ADR-005 tRPC](./005-api-trpc.md)
- [App surfaces and repo](../00-overview/04-app-surfaces-and-repo.md)
