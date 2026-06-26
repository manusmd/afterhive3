# Platform Permission Matrix

## Purpose

Platform backoffice permissions.

## Scope

MVP full ops

| Resource / Action | superadmin | support | finance |
|-------------------|------------|---------|---------|
| tenant.read | Y | Y | Y |
| tenant.create | Y | - | - |
| tenant.suspend | Y | - | - |
| tenant.modules | Y | - | - |
| impersonate.start | Y | Y | - |
| subscription.read | Y | Y | Y |
| subscription.write | Y | - | Y |
| audit.read | Y | Y | Y |
| system.settings | Y | - | - |

## Impersonation constraints

- support: read + non-destructive actions; no billing.issue, no role.assign
- superadmin: unrestricted except delete tenant without confirmation
