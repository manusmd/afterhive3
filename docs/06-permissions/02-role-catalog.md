# Role Catalog

## Purpose

Machine-readable role definitions.

## Scope

MVP

## Platform

| Role | Inherits |
|------|----------|
| platform_superadmin | all platform actions |
| platform_support | read tenants, impersonate, read audit |
| platform_finance | subscriptions, platform invoices |

## Tenant

| Role | Location scope default |
|------|------------------------|
| tenant_owner | all |
| tenant_admin | all |
| tenant_office | assigned |
| tenant_coach | assigned |
| tenant_finance | all |
| tenant_location_manager | single location all actions in location |

## Portal

| Role | Scope |
|------|-------|
| portal_parent | linked minors + household billing |
| portal_adult_member | self person only |
| portal_self_payer | invoices where payer relationship |

## Module gates

Actions prefixed `club.` require `club_sport`. `billing.` require `billing`. etc.
