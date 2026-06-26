# ADR-001: Stack and Monorepo Layout

## Status

Accepted

## Context

Afterhive needs a typed full-stack codebase for four product surfaces, background jobs, search, and file storage, deployable on a single Docker host.

## Decision

| Layer | Choice |
|-------|--------|
| Monorepo | Turborepo |
| Language | TypeScript |
| Surface apps | **Four separate Next.js apps** (not one `apps/web`) |
| Worker | Node (`apps/worker`) + BullMQ |
| Database | PostgreSQL + Drizzle ORM |
| API | tRPC in `packages/api`, mounted per app |
| Auth | Better Auth |
| Queue | BullMQ + Redis |
| Search | Meilisearch |
| Object storage | Cloudflare R2 (S3-compatible) |
| UI | MUI v9 |
| Observability | Sentry + Pino |

### Apps

```
apps/platform/     # Platform backoffice
apps/admin/        # Tenant admin
apps/portal/       # Self-service portal
apps/marketplace/  # Public marketplace
apps/worker/       # Background jobs
```

### Packages

```
packages/db, domain, api, ui, shared
```

**No NestJS.** See [ADR-013](./013-no-nestjs.md).

Full surface mapping: [App surfaces and repo](../00-overview/04-app-surfaces-and-repo.md).

## Consequences

- Each surface builds and deploys independently; shared logic must live in packages, not copied across apps
- CI runs Turborepo pipeline per affected app
- New engineers onboard per surface app + `packages/api`

## Related

- [ADR-002 Deployment](./002-deployment-docker.md)
- [ADR-005 tRPC](./005-api-trpc.md)
