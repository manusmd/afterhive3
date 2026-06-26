# Security Model

## Purpose

Defense in depth for multi-tenant SaaS.

## Layers

1. TLS termination (nginx)
2. Authentication (Better Auth sessions)
3. Authorization (policy engine)
4. Tenancy isolation (tenant_id + optional RLS)
5. Audit logging (sensitive actions)
6. Data classification (field-level restrictions)

## Threat priorities

| Threat | Mitigation |
|--------|------------|
| Cross-tenant data leak | Server tenant filter, tests |
| IDOR | Policy on every get by id |
| Session hijack | HttpOnly cookies, rotation |
| Impersonation abuse | TTL, audit, limited roles |
| File access bypass | Signed URLs + policy |
| Injection | Zod + parameterized queries |

## Sensitive fields

`medical_notes`, payment metadata — restricted roles

## Related

[02-audit-log-schema.md](02-audit-log-schema.md), [06-permissions/](../06-permissions/)
