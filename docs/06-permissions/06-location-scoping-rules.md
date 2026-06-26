# Location Scoping Rules

## Purpose

How location_ids filter queries and policies.

## Scope

MVP multi-location

## Staff assignment

`ENT-RoleAssignment.location_ids`:

- Empty array = all locations (owner, admin, finance)
- Non-empty = only those location_ids

## Resource location

Entities with `location_id`: Person (optional default), Lead, Offer, OfferGroup, Session, Department

## Query filter

```sql
WHERE tenant_id = :tid AND (location_id = ANY(:scoped) OR :all_locations)
```

## Portal

Portal users see sessions/invoices filtered by enrollments' offer_group.location_id; parents see union of all children's locations.

## Location manager

`tenant_location_manager` role: location_ids exactly one; treated as admin within that location per matrix.

## Cross-location

Enrolling member in another location requires office role with both locations or all-locations role.
