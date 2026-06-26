# Read Models and Projections

## Purpose

Query-optimized views for dashboards and portal.

## Read models (MVP)

| Model | Source | Used by |
|-------|--------|---------|
| DashboardWidgets | SQL aggregates | SCR-admin-dashboard |
| BillingAgingSummary | invoices grouped by age | SCR-admin-billing-dashboard |
| SessionCalendarRow | sessions + offer names | SCR-admin-calendar |
| PortalScheduleWeek | sessions for member enrollments | SCR-portal-schedule |
| PublicOfferCard | PublicOfferProjection + provider | SCR-marketplace-search |

## Implementation

MVP: SQL views or Drizzle query modules in `packages/domain/read-models`

Post-MVP: materialized views refreshed by jobs

## Rules

- Read models never bypass tenant_id filter
- Portal read models filter by linked person_ids from session
