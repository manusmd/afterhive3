# ADR-005: API Layer — tRPC

## Status

Accepted

## Context

Type-safe API between Next.js surface apps and the domain layer; use-case-oriented procedures. No standalone NestJS or Express API server.

## Decision

- **tRPC v11** with Superjson
- **Router definitions:** all in `packages/api` — `platform`, `tenant`, `portal`, `marketplace`, `internal`
- **Mounting:** each Next.js app exposes `/api/trpc` and registers only the namespaces its surface may call:

| App | Routers |
|-----|---------|
| `apps/platform` | `platform` |
| `apps/admin` | `tenant` |
| `apps/portal` | `portal` |
| `apps/marketplace` | `marketplace` |

- **`internal`:** not mounted on public apps; used from `apps/worker` and server-only scripts via direct caller
- **Naming:** `domain.verbNoun` e.g. `crm.convertLead`, `billing.issueInvoiceDraft`
- **Not CRUD-first:** procedures express use cases ([09-api-and-events/02-procedure-catalog.md](../09-api-and-events/02-procedure-catalog.md))
- **Errors:** `TRPCError` codes + domain error codes in `cause.data.code`
- **Pagination:** cursor-based keyset; see conventions doc

## Consequences

- Zod input/output in `packages/shared`
- Server Components call routers directly; client uses React Query integration
- Cross-surface calls (e.g. marketplace booking → tenant data) go through `marketplace` router with explicit public/safe procedures

## Related

- [001-stack-and-repo.md](001-stack-and-repo.md)
- [013-no-nestjs.md](013-no-nestjs.md)
- [App surfaces and repo](../00-overview/04-app-surfaces-and-repo.md)
