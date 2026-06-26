# Member and Enrollment

## Purpose

Member profiles and offer enrollments.

## Scope

MVP

## Entities

### ENT-MemberProfile

| Field | Type | Required | Unique | Indexed | Notes |
|-------|------|----------|--------|---------|-------|
| id | UUID | yes | PK | yes | |
| tenant_id | UUID | yes | | yes | |
| person_id | UUID | yes | | yes | |
| member_number | string | yes | tenant+number | yes | |
| status | enum | yes | | yes | `prospect`,`active`,`paused`,`ended` |
| started_at | date | no | | | |
| ended_at | date | no | | | |
| medical_notes | text | no | | | Restricted field |
| consent_status | enum | yes | | | `pending`,`complete` |

Unique: `(tenant_id, person_id)` one active member profile per person

### ENT-Enrollment

| Field | Type | Required | Unique | Indexed | Notes |
|-------|------|----------|--------|---------|-------|
| id | UUID | yes | PK | yes | |
| tenant_id | UUID | yes | | yes | |
| member_profile_id | UUID | yes | | yes | |
| offer_group_id | UUID | yes | | yes | |
| contract_id | UUID | no | | | Billing link |
| status | enum | yes | | yes | State machine |
| enrolled_at | timestamptz | yes | | | |
| ended_at | timestamptz | no | | | |
| end_reason | enum | no | | | `completed`,`canceled`,`transferred` |

Unique: `(tenant_id, member_profile_id, offer_group_id)` where status active

## Relationships

- MemberProfile N:1 Person
- Enrollment N:1 OfferGroup N:1 Offer
- Enrollment 0:1 Contract

## States

[04-state-machines/enrollments.md](../04-state-machines/enrollments.md)

## Invariants

- Minor enrollment requires consent_status complete
- Active enrollment counts toward OfferGroup capacity
- End enrollment does not delete attendance history

## Permissions

Tenant admin + portal read own

## API procedures

`PROC-enrollment.create`, `PROC-enrollment.end`, `PROC-enrollment.transfer`

## UI surfaces

`SCR-admin-members-*`, `SCR-portal-bookings-*`

## Events

`EVT-EnrollmentCreated`, `EVT-EnrollmentEnded`

## Open questions

None.
