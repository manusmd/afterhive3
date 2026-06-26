# Impersonation Policy

## Purpose

Platform support impersonation rules.

## Scope

MVP

## Who

`platform_superadmin`, `platform_support` (limited)

## Requirements

- Active ticket/reference in `reason` field
- Max TTL 1 hour
- Banner on all pages: "Impersonating {user} — End session"
- Audit: EVT-ImpersonationStarted, every action logs impersonator_user_id

## Blocked while impersonating

- platform role changes
- tenant_owner removal
- export bulk >1000 rows (superadmin only)

## End conditions

- Manual end
- TTL expiry
- Target user password change (future)

## UI

`SCR-platform-impersonate-dialog`, persistent `ImpersonationBanner` component

## API

`PROC-platform.startImpersonation`, `PROC-platform.endImpersonation`
