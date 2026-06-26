# Locations and Resources

## Purpose

Multi-location tenants, rooms/fields for scheduling conflicts.

## Scope

MVP multi-location with permission scoping.

## Entities

### ENT-Location

| Field | Type | Required | Unique | Indexed | Notes |
|-------|------|----------|--------|---------|-------|
| id | UUID | yes | PK | yes | |
| tenant_id | UUID | yes | | yes | |
| name | string | yes | | | |
| code | string | yes | tenant+code | yes | Short |
| address | jsonb | no | | | |
| timezone | string | no | | | Override tenant |
| status | enum | yes | | | `active`,`inactive` |

### ENT-Resource

| Field | Type | Required | Unique | Indexed | Notes |
|-------|------|----------|--------|---------|-------|
| id | UUID | yes | PK | yes | |
| tenant_id | UUID | yes | | yes | |
| location_id | UUID | yes | | yes | |
| name | string | yes | | | Room/field name |
| type | enum | yes | | | `room`,`field`,`court`,`other` |
| capacity | int | no | | | |

## Relationships

- Location 1:N Resource 1:N Session (optional resource_id)

## Invariants

- At least one active location per tenant
- Session location_id must match resource.location_id if resource set
- Staff location scope filters all list queries

## Permissions

[06-permissions/06-location-scoping-rules.md](../06-permissions/06-location-scoping-rules.md)

## API procedures

`PROC-location.create`, `PROC-resource.create`

## UI surfaces

`SCR-admin-settings-locations`

## Open questions

None.
