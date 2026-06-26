# Flow: Platform Impersonation Support

## Purpose

Support assists tenant user under audit.

## Steps

```mermaid
sequenceDiagram
  participant Support
  participant API
  participant TenantUI

  Support->>API: PROC-platform.startImpersonation
  API->>API: Create ImpersonationSession
  Support->>TenantUI: Redirect /app/:slug with banner
  TenantUI->>API: Actions as target user
  Support->>API: PROC-platform.endImpersonation
```

## Policy

[06-permissions/07-impersonation-policy.md](../06-permissions/07-impersonation-policy.md)

## Screens

`SCR-platform-tenant-detail`, impersonation banner all admin screens

## AC

EPIC-003
