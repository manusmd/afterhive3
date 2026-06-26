# ADR-003: Authentication — Better Auth

## Status

Accepted

## Context

Four separate Next.js apps (platform, admin, portal, marketplace) need session auth with role and tenant context. Unified accounts: one user may hold staff and portal roles per tenant.

## Decision

- **Library:** Better Auth (self-hosted, PostgreSQL sessions)
- **Per-app auth handler:** each login-capable app runs Better Auth at its own `/api/auth/*` route (`apps/platform`, `apps/admin`, `apps/portal`; marketplace is mostly anonymous)
- **Separate login URLs:**
  - Platform: `/platform/login` (`apps/platform`)
  - Tenant admin: `/app/:tenantSlug/login` (`apps/admin`)
  - Portal: `/portal/:tenantSlug/login` (`apps/portal`)
- **Unified user record:** `ENT-User` with `ENT-TenantMembership` and role assignments
- **Staff invite:** email link sets password or SSO later
- **Portal invite:** magic link or password; guardian invites for minors
- **Session storage:** PostgreSQL (Redis cache optional post-MVP)
- **Cookie scope:** per app origin/path in MVP; subdomain strategy in [ADR-010](./010-routing-path-to-subdomain.md)

## Session claims (server-resolved)

```typescript
type SessionContext = {
  userId: string;
  surface: 'platform' | 'tenant_admin' | 'portal';
  tenantId?: string;
  tenantSlug?: string;
  roles: string[];
  locationIds?: string[]; // staff location scope
  impersonation?: { actorUserId: string; expiresAt: string };
};
```

## Consequences

- Every tRPC procedure validates session + surface + tenant
- Impersonation adds banner + audit ([06-permissions/07-impersonation-policy.md](../06-permissions/07-impersonation-policy.md))
- Shared auth config lives in `packages/shared` or `packages/api`; each app wires the same plugins with different `basePath`

## Related

- [004-tenancy-row-level.md](004-tenancy-row-level.md)
- [App surfaces and repo](../00-overview/04-app-surfaces-and-repo.md)
- [03-domain-model/01-identity-and-access.md](../03-domain-model/01-identity-and-access.md)
