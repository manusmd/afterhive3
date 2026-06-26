# Flow: Portal Invite and Self-Service

## Purpose

Portal user activation and profile edit.

## Steps

```mermaid
sequenceDiagram
  participant Staff
  participant Portal
  participant API

  Staff->>API: PROC-auth.invitePortalUser
  Portal->>API: Magic link signup
  API->>API: Link user to person_id
  Portal->>API: PROC-portal.updateProfile
  Portal->>API: PROC-portal.submitRequest
```

## Screens

`SCR-portal-invite`, `SCR-portal-profile`, `SCR-portal-requests`

## AC

EPIC-040
