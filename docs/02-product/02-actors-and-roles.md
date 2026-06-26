# Actors and Roles

## Purpose

Catalog all actor types and role assignments per surface.

## Scope

MVP roles; extensible via `ENT-RoleAssignment`.

## Platform roles

| Role ID | Description |
|---------|-------------|
| `platform_superadmin` | Full platform access |
| `platform_support` | Tenant view, impersonation, tickets |
| `platform_finance` | Tenant subscriptions, credits, platform invoices |

## Tenant staff roles

| Role ID | Description | Location scope |
|---------|-------------|----------------|
| `tenant_owner` | Full tenant control | All locations |
| `tenant_admin` | Admin except billing plan change | All locations |
| `tenant_office` | CRM, scheduling, comms | Assigned locations |
| `tenant_coach` | Sessions, attendance, roster, chat | Assigned locations |
| `tenant_finance` | Invoices, contracts, dunning | All locations |
| `tenant_location_manager` | Admin within one location | Single location |

## Portal roles

| Role ID | Description |
|---------|-------------|
| `portal_parent` | Guardian; sees linked minors + household billing |
| `portal_adult_member` | Self; own enrollments and invoices |
| `portal_self_payer` | Payer without being member |

One `ENT-User` may hold multiple portal and/or staff roles per tenant via `ENT-TenantMembership`.

## Relationships

- Roles assigned via `ENT-RoleAssignment` (user, tenant, role, locationIds?)
- Portal access linked to `ENT-Person` records

## Permissions

See [06-permissions/02-role-catalog.md](../06-permissions/02-role-catalog.md).

## Open questions

None.
