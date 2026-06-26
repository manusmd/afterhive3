# Identity and Access

## Purpose

Users, tenants, memberships, roles, impersonation.

## Scope

MVP

## Entities

### ENT-Tenant

| Field | Type | Required | Unique | Indexed | Notes |
|-------|------|----------|--------|---------|-------|
| id | UUID | yes | PK | yes | |
| slug | string | yes | global | yes | ADR-010 |
| name | string | yes | | | Display |
| legal_name | string | yes | | | Invoices |
| status | enum | yes | | yes | `trial`,`active`,`suspended`,`closed` |
| modules | jsonb | yes | | | Module IDs array |
| default_locale | string | yes | | | `de` |
| timezone | string | yes | | | IANA |
| vat_id | string | no | | | USt-IdNr |
| kleinunternehmer | boolean | yes | | | VAT exempt |
| settings | jsonb | yes | | | Number sequences, branding |

### ENT-User

| Field | Type | Required | Unique | Indexed | Notes |
|-------|------|----------|--------|---------|-------|
| id | UUID | yes | PK | yes | |
| email | string | yes | global | yes | Normalized lower |
| email_verified_at | timestamptz | no | | | |
| password_hash | string | no | | | Null if magic-link only |
| name | string | no | | | |
| status | enum | yes | | | `active`,`disabled` |

### ENT-TenantMembership

| Field | Type | Required | Unique | Indexed | Notes |
|-------|------|----------|--------|---------|-------|
| id | UUID | yes | PK | yes | |
| tenant_id | UUID | yes | | yes | |
| user_id | UUID | yes | | yes | |
| person_id | UUID | no | | | Portal link to Person |
| status | enum | yes | | | `invited`,`active`,`removed` |
| invited_at | timestamptz | no | | | |
| accepted_at | timestamptz | no | | | |

Unique: `(tenant_id, user_id)`

### ENT-RoleAssignment

| Field | Type | Required | Unique | Indexed | Notes |
|-------|------|----------|--------|---------|-------|
| id | UUID | yes | PK | yes | |
| tenant_id | UUID | yes | | yes | |
| membership_id | UUID | yes | | yes | FK membership |
| role | string | yes | | yes | Role ID from catalog |
| location_ids | uuid[] | no | | | Empty = all locations |

### ENT-UserPreference

| Field | Type | Required | Unique | Indexed | Notes |
|-------|------|----------|--------|---------|-------|
| user_id | UUID | yes | PK | | |
| theme_mode | enum | yes | | | `light`,`dark`,`system` |
| locale | string | yes | | | `de` |

### ENT-ImpersonationSession

| Field | Type | Required | Unique | Indexed | Notes |
|-------|------|----------|--------|---------|-------|
| id | UUID | yes | PK | yes | |
| actor_user_id | UUID | yes | | yes | Platform staff |
| target_membership_id | UUID | yes | | | |
| tenant_id | UUID | yes | | | |
| reason | string | yes | | | Ticket ref |
| started_at | timestamptz | yes | | | |
| expires_at | timestamptz | yes | | | Max 1h |
| ended_at | timestamptz | no | | | |

## Relationships

- User 1:N TenantMembership N:1 Tenant
- TenantMembership 1:N RoleAssignment
- ImpersonationSession N:1 TenantMembership (target)

## States

Platform tenant status: see platform ops. Membership: invited → active.

## Invariants

- At least one `tenant_owner` per active tenant
- Slug immutable after create
- Impersonation max TTL 1 hour

## Permissions

[06-permissions/05-permission-matrix-platform.md](../06-permissions/05-permission-matrix-platform.md)

## API procedures

`PROC-auth.*`, `PROC-platform.createTenant`, `PROC-platform.impersonate`

## UI surfaces

`SCR-platform-*`, login screens

## Events

`EVT-TenantCreated`, `EVT-UserInvited`, `EVT-ImpersonationStarted`

## Open questions

None.
