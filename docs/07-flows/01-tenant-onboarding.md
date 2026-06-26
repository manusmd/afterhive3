# Flow: Tenant Onboarding

## Purpose

Platform creates tenant; first owner accesses admin.

## Actors

platform_superadmin, tenant_owner

## Steps

```mermaid
sequenceDiagram
  participant PA as PlatformAdmin
  participant API as tRPC
  participant Stripe
  participant Owner as TenantOwner

  PA->>API: PROC-platform.createTenant
  API->>Stripe: Create customer
  API->>API: Seed location, modules, settings
  API-->>PA: tenant slug, invite link
  PA->>Owner: Send invite email
  Owner->>API: Accept invite, set password
  Owner->>API: PROC-auth.completeOnboarding
  Owner->>API: Configure locations, branding
```

## Procedures

`PROC-platform.createTenant`, `PROC-platform.createSubscription`, `PROC-auth.acceptInvite`

## Screens

`SCR-platform-tenant-create`, `SCR-admin-onboarding`

## AC reference

EPIC-001
