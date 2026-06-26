# Offers and Scheduling

## Purpose

Offers, groups, seasons, sessions, recurrence, staff assignment.

## Scope

MVP

## Entities

### ENT-Season

| Field | Type | Required | Unique | Indexed | Notes |
|-------|------|----------|--------|---------|-------|
| id | UUID | yes | PK | yes | |
| tenant_id | UUID | yes | | yes | |
| name | string | yes | | | e.g. "2025/26" |
| start_date | date | yes | | | |
| end_date | date | yes | | | |

### ENT-Offer

| Field | Type | Required | Unique | Indexed | Notes |
|-------|------|----------|--------|---------|-------|
| id | UUID | yes | PK | yes | |
| tenant_id | UUID | yes | | yes | |
| name | string | yes | | yes | Search |
| description | text | no | | | |
| type | enum | yes | | | `team`,`course`,`workshop`,`subscription` |
| vertical | enum | yes | | | `core`,`club_sport` |
| department_id | UUID | no | | | Club/Sport |
| location_id | UUID | yes | | yes | Default location |
| status | enum | yes | | yes | Publication state |
| capacity_default | int | no | | | |
| tariff_id | UUID | no | | | Default tariff |

### ENT-OfferGroup

| Field | Type | Required | Unique | Indexed | Notes |
|-------|------|----------|--------|---------|-------|
| id | UUID | yes | PK | yes | |
| tenant_id | UUID | yes | | yes | |
| offer_id | UUID | yes | | yes | |
| season_id | UUID | no | | | |
| team_id | UUID | no | | | Club link |
| name | string | yes | | | e.g. "U12 Group A" |
| capacity | int | yes | | | |
| enrolled_count | int | yes | | | Denormalized |
| waitlist_enabled | boolean | yes | | | |
| location_id | UUID | yes | | | |
| status | enum | yes | | | `draft`,`open`,`full`,`closed` |

### ENT-RecurrenceRule

| Field | Type | Required | Unique | Indexed | Notes |
|-------|------|----------|--------|---------|-------|
| id | UUID | yes | PK | yes | |
| tenant_id | UUID | yes | | yes | |
| offer_group_id | UUID | yes | | | |
| rrule | string | yes | | | RFC 5545 subset |
| timezone | string | yes | | | |
| dtstart | timestamptz | yes | | | |
| until | timestamptz | no | | | |
| duration_minutes | int | yes | | | |

### ENT-Session

| Field | Type | Required | Unique | Indexed | Notes |
|-------|------|----------|--------|---------|-------|
| id | UUID | yes | PK | yes | |
| tenant_id | UUID | yes | | yes | |
| offer_group_id | UUID | yes | | yes | |
| location_id | UUID | yes | | yes | |
| resource_id | UUID | no | | | Room/field |
| starts_at | timestamptz | yes | | yes | Calendar queries |
| ends_at | timestamptz | yes | | | |
| status | enum | yes | | yes | State machine |
| title | string | no | | | Override |
| cancellation_reason | text | no | | | |
| notes | text | no | | | Staff |

### ENT-SessionStaffAssignment

| Field | Type | Required | Unique | Indexed | Notes |
|-------|------|----------|--------|---------|-------|
| id | UUID | yes | PK | yes | |
| tenant_id | UUID | yes | | yes | |
| session_id | UUID | yes | | yes | |
| user_id | UUID | yes | | | Coach staff |
| role | enum | yes | | | `lead`,`assistant` |

## Relationships

- Offer 1:N OfferGroup 1:N Session
- OfferGroup 0:1 Team (club)
- RecurrenceRule generates Session instances via job

## States

[04-state-machines/offers-publication.md](../04-state-machines/offers-publication.md), [sessions.md](../04-state-machines/sessions.md)

## Invariants

- Session ends_at > starts_at
- enrolled_count <= capacity (or waitlist)
- Cancel session does not delete attendance records

## Permissions

Location-scoped for coaches

## API procedures

`PROC-offer.create`, `PROC-schedule.generateSessions`, `PROC-schedule.moveSession`, `PROC-schedule.cancelSession`

## UI surfaces

`SCR-admin-offers-*`, `SCR-admin-calendar-*`

## Events

`EVT-SessionScheduled`, `EVT-SessionCanceled`, `EVT-OfferPublished`

## Open questions

None.
