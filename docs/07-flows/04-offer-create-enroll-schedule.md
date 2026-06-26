# Flow: Offer Create, Enroll, Schedule

## Purpose

End-to-end program setup.

## Steps

```mermaid
sequenceDiagram
  participant Staff
  participant API
  participant Worker

  Staff->>API: PROC-offer.create + OfferGroup
  Staff->>API: PROC-club.createTeam (optional)
  Staff->>API: PROC-schedule.setRecurrence
  API->>Worker: JOB-generate-sessions
  Worker->>API: Create Session rows
  Staff->>API: PROC-enrollment.enroll
  API->>API: Update capacity / waitlist
```

## Screens

`SCR-admin-offer-detail`, `SCR-admin-enroll-modal`, `SCR-admin-calendar`

## AC

EPIC-020, EPIC-021
