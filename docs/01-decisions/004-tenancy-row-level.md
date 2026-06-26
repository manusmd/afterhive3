# ADR-004: Multi-Tenancy — Row-Level

## Status

Accepted

## Context

Small tenants (<500 members), single database, strong isolation required.

## Decision

- **Strategy:** Shared PostgreSQL, `tenant_id UUID NOT NULL` on all tenant-scoped tables
- **Enforcement:** Application layer mandatory filter; optional PostgreSQL RLS as defense-in-depth (recommended for production)
- **Platform tables:** No `tenant_id` (e.g. `platform_tenants`, `platform_subscriptions`)
- **Cross-tenant IDs:** Never accepted from client without platform role verification

## Tenant resolution

1. Path: `/app/:tenantSlug` → lookup tenant by slug
2. Session must include matching `tenantId` for mutations
3. Subdomain migration: ADR-010

## Consequences

- All Drizzle queries use tenant-scoped repository helpers
- Indexes: composite `(tenant_id, ...)` on hot paths
- Tests must include cross-tenant isolation cases

## Related

- [010-routing-path-to-subdomain.md](010-routing-path-to-subdomain.md)
