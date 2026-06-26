# Attendance and Waitlist

## Purpose

Session attendance and capacity waitlist.

## Scope

MVP

## Entities

### ENT-AttendanceRecord

| Field | Type | Required | Unique | Indexed | Notes |
|-------|------|----------|--------|---------|-------|
| id | UUID | yes | PK | yes | |
| tenant_id | UUID | yes | | yes | |
| session_id | UUID | yes | | yes | |
| member_profile_id | UUID | yes | | yes | |
| status | enum | yes | | | `present`,`absent`,`excused`,`late` |
| recorded_at | timestamptz | yes | | | |
| recorded_by_user_id | UUID | yes | | | |
| notes | text | no | | | |

Unique: `(session_id, member_profile_id)`

### ENT-WaitlistEntry

| Field | Type | Required | Unique | Indexed | Notes |
|-------|------|----------|--------|---------|-------|
| id | UUID | yes | PK | yes | |
| tenant_id | UUID | yes | | yes | |
| offer_group_id | UUID | yes | | yes | |
| member_profile_id | UUID | yes | | yes | |
| position | int | yes | | yes | 1-based |
| status | enum | yes | | yes | State machine |
| requested_at | timestamptz | yes | | | |
| promoted_at | timestamptz | no | | | |

## Relationships

- AttendanceRecord N:1 Session, N:1 MemberProfile
- WaitlistEntry N:1 OfferGroup

## States

[04-state-machines/waitlist.md](../04-state-machines/waitlist.md)

## Invariants

- Only enrolled or roster members appear on session attendance list
- Promote waitlist only when capacity available
- Per-session billing uses attendance status per rules

## Permissions

Coaches: record attendance for assigned sessions

## API procedures

`PROC-attendance.recordBulk`, `PROC-waitlist.promoteNext`

## UI surfaces

`SCR-admin-session-detail`, `SCR-admin-roster-*`

## Events

`EVT-AttendanceRecorded`, `EVT-WaitlistPromoted`

## Open questions

None.
