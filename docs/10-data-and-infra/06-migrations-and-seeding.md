# Migrations and Seeding

## Purpose

Schema evolution and demo data.

## Migrations

- Drizzle Kit: `pnpm db:generate`, `pnpm db:migrate`
- One migration per logical change; never edit applied migrations
- Tenant-agnostic platform tables migrated first

## Seed (development)

| Data | Content |
|------|---------|
| Platform admin | superadmin user |
| Demo tenant | slug `demo-club`, modules all MVP |
| Locations | 2 locations |
| Club | 1 department, 2 teams, sample roster |
| CRM | 10 leads, 20 persons, 5 members |
| Scheduling | 4 weeks sessions |
| Billing | 2 tariffs, sample invoices |

## Production seed

Platform roles only; no demo tenant

## Idempotent seeds

Use fixed UUIDs in seed script for doc examples
