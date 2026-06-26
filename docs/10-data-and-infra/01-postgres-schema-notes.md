# PostgreSQL Schema Notes

## Purpose

DB conventions, indexes, tenant pattern.

## tenant_id

Every tenant table: `tenant_id UUID NOT NULL REFERENCES tenants(id)`

## Recommended indexes

| Table | Index |
|-------|-------|
| persons | (tenant_id, last_name, first_name) |
| leads | (tenant_id, status, last_activity_at DESC) |
| sessions | (tenant_id, starts_at) WHERE status != canceled |
| enrollments | (tenant_id, offer_group_id, status) |
| invoices | (tenant_id, status, due_date) |
| messages | (tenant_id, thread_id, created_at) |

## Constraints

- FK ON DELETE RESTRICT default; soft delete preferred
- Check constraints on enums via PostgreSQL enum types or text + app validation

## RLS (recommended production)

```sql
ALTER TABLE persons ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation ON persons
  USING (tenant_id = current_setting('app.tenant_id')::uuid);
```

Set `app.tenant_id` per connection in middleware.

## Drizzle

Migrations in `packages/db/migrations/`; snake_case columns.

## Full-text fallback

`search_document tsvector` on persons, leads — GIN index for Meilisearch outage.
