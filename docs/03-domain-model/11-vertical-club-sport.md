# Vertical: Club/Sport

## Purpose

Departments, teams, roster, trainer assignments for sports clubs.

## Scope

MVP vertical (not tutoring).

## Entities

### ENT-Department

| Field | Type | Required | Unique | Indexed | Notes |
|-------|------|----------|--------|---------|-------|
| id | UUID | yes | PK | yes | |
| tenant_id | UUID | yes | | yes | |
| location_id | UUID | yes | | yes | |
| name | string | yes | | | e.g. Football |
| sort_order | int | yes | | | |

### ENT-Team

| Field | Type | Required | Unique | Indexed | Notes |
|-------|------|----------|--------|---------|-------|
| id | UUID | yes | PK | yes | |
| tenant_id | UUID | yes | | yes | |
| department_id | UUID | yes | | yes | |
| offer_id | UUID | yes | | | Linked offer |
| name | string | yes | | | e.g. U12 |
| age_group | string | no | | | |
| season_id | UUID | no | | | |

### ENT-RosterEntry

| Field | Type | Required | Unique | Indexed | Notes |
|-------|------|----------|--------|---------|-------|
| id | UUID | yes | PK | yes | |
| tenant_id | UUID | yes | | yes | |
| team_id | UUID | yes | | yes | |
| member_profile_id | UUID | yes | | yes | |
| jersey_number | string | no | | | |
| status | enum | yes | | | `active`,`inactive` |
| from_date | date | yes | | | |
| to_date | date | no | | | |

Unique: `(team_id, member_profile_id)` where active

### ENT-TrainerAssignment

| Field | Type | Required | Unique | Indexed | Notes |
|-------|------|----------|--------|---------|-------|
| id | UUID | yes | PK | yes | |
| tenant_id | UUID | yes | | yes | |
| team_id | UUID | no | | | XOR session |
| session_id | UUID | no | | | XOR team |
| user_id | UUID | yes | | | Staff coach |
| role | enum | yes | | | `head`,`assistant` |

## Relationships

- Department 1:N Team 1:N RosterEntry N:1 MemberProfile
- Team 1:1 Offer (vertical link)
- OfferGroup may reference team_id

## Invariants

- Module `club_sport` required for mutations
- Roster member should have enrollment to linked offer group (warning if not)
- Tournaments/events out of MVP scope

## Permissions

Coaches: roster read, attendance write for assigned teams/sessions

## API procedures

`PROC-club.createTeam`, `PROC-club.updateRoster`, `PROC-club.assignTrainer`

## UI surfaces

`SCR-admin-club-*`

## Events

`EVT-RosterUpdated`, `EVT-TrainerAssigned`

## Open questions

None.
