# Policy Model

## Purpose

Server-side authorization architecture.

## Scope

All surfaces

## Evaluation order

1. Authenticated session valid
2. Surface matches route (platform vs tenant admin vs portal)
3. Tenant membership active (if tenant-scoped)
4. Module enabled on tenant
5. Role assignment includes action
6. Location scope includes resource location_id
7. Object-level rule (ownership, linked person for portal)

## Policy signature

```typescript
can(ctx: SessionContext, action: Action, resource: ResourceRef): PolicyResult
```

## Action verbs

`read`, `create`, `update`, `delete`, `export`, `approve`, `issue`, `impersonate`

## Implementation

- Policies in `packages/domain/policies`
- tRPC middleware calls policy before service
- UI uses same policy for visibility (cached)

## Deny default

Unlisted = deny.

## Testing

Matrix tests per role × action × location scope.
