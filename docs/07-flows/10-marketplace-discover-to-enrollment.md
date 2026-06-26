# Flow: Marketplace Discover to Enrollment

## Purpose

Public booking request to tenant pipeline.

## Steps

```mermaid
sequenceDiagram
  participant Public
  participant API
  participant Staff

  Public->>API: PROC-marketplace.search
  Public->>API: PROC-marketplace.submitBookingRequest
  API->>Staff: Notify new request
  Staff->>API: Accept request
  alt direct enroll config
    API->>API: Create enrollment
  else lead path
    API->>API: Create lead from request
  end
```

## Screens

`SCR-marketplace-search`, `SCR-marketplace-offer`, `SCR-admin-booking-requests`

## AC

EPIC-050 (post-MVP build, spec complete)
