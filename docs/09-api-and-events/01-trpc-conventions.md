# tRPC Conventions

## Purpose

Standard patterns for all procedures.

## Context middleware

Every tenant procedure receives:

```typescript
{ session, tenantId, tenantSlug, locationScope, modules }
```

## Errors

| Code | HTTP | When |
|------|------|------|
| UNAUTHORIZED | 401 | No session |
| FORBIDDEN | 403 | Policy deny |
| NOT_FOUND | 404 | Missing or cross-tenant |
| BAD_REQUEST | 400 | Zod validation |
| CONFLICT | 409 | State machine violation |
| PRECONDITION_FAILED | 412 | Business rule block |

Domain codes in `data: { code: 'CAPACITY_FULL' }`

## Pagination

Input: `{ cursor?: string, limit: number (max 100), sort, filters }`

Output: `{ items, nextCursor, totalEstimate? }`

Cursor: base64 encoded `(sortValue, id)`

## Idempotency

Mutations accepting `idempotencyKey?: string` — store 24h dedup in Redis.

## Naming

`router.procedure.use(requireTenant).input(z).mutation/service`

## Related

[02-procedure-catalog.md](02-procedure-catalog.md)
