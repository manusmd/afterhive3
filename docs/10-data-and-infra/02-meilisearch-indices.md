# Meilisearch Indices

## Purpose

Search index definitions.

## Indices

### persons

- Primary key: `id`
- Filterable: `tenant_id`, `location_id`, `status`
- Searchable: `first_name`, `last_name`, `email`, `phone`, `member_number`
- Sortable: `last_name`

### leads

- Filterable: `tenant_id`, `status`, `location_id`, `assigned_to`
- Searchable: `first_name`, `last_name`, `email`, `tags`

### offers

- Filterable: `tenant_id`, `status`, `location_id`, `vertical`
- Searchable: `name`, `description`

### public_offers (marketplace)

- Filterable: `location_id`, `age_range`, `published`
- Searchable: `title`, `description`, `provider_name`
- No `tenant_id` in public API — filter by slug internally

## Sync

EVT-* → JOB-search-upsert/delete

## Tenant isolation

Admin searches always filter `tenant_id={ctx.tenantId}`

## Reindex

JOB-meilisearch-reindex per tenant after import
