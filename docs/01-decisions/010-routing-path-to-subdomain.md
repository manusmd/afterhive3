# ADR-010: Routing — Path-Based MVP, Subdomain Migration

## Status

Accepted

## Context

Four separate Next.js apps behind one reverse proxy. Tenant resolution via URL. MVP on single domain; white-label subdomains later.

## Decision

### MVP (path-based, one domain)

Each surface is a **separate Next.js deployable**; nginx routes by path prefix:

| Surface | App | Public path prefix |
|---------|-----|-------------------|
| Platform | `apps/platform` | `/platform/*` |
| Tenant admin | `apps/admin` | `/app/:tenantSlug/*` |
| Portal | `apps/portal` | `/portal/:tenantSlug/*` |
| Marketplace | `apps/marketplace` | `/discover/*` |

Apps use Next.js `basePath` matching the prefix (e.g. admin `basePath: '/app'` with dynamic tenant segment in app router).

### Tenant slug

- Unique globally, `[a-z0-9-]`, 3–48 chars
- Immutable after creation (display name can change)

### Future subdomain mapping (document only)

| Surface | App | Example host |
|---------|-----|----------------|
| Platform | `apps/platform` | `platform.afterhive.com` |
| Tenant admin | `apps/admin` | `{tenantSlug}.afterhive.com` or custom domain |
| Portal | `apps/portal` | `portal.{tenantSlug}.afterhive.com` |
| Marketplace | `apps/marketplace` | `discover.afterhive.com` |

Migration: middleware resolves tenant from `Host` header with fallback to path. Session cookies scoped per parent domain strategy in migration appendix.

## Consequences

- `tenantSlug` in all tenant-scoped links
- SEO marketplace URLs: `/discover/offers/:publicSlug`
- Four build pipelines; nginx config must stay aligned with app `basePath`

## Related

- [004-tenancy-row-level.md](004-tenancy-row-level.md)
- [002-deployment-docker.md](002-deployment-docker.md)
- [App surfaces and repo](../00-overview/04-app-surfaces-and-repo.md)
