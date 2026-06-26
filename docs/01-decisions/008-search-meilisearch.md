# ADR-008: Search — Meilisearch

## Status

Accepted

## Context

CRM full-text search, offer lists, marketplace discovery. Small tenants but good UX requires fast search.

## Decision

- **Engine:** Meilisearch (Docker service in Compose)
- **Sync:** Domain events → `search` queue → index upsert/delete
- **Indices:** `persons`, `leads`, `members`, `offers`, `public_offers` (see infra doc)
- **Tenant isolation:** `tenant_id` as filterable attribute; marketplace index separate

## Consequences

- Postgres remains source of truth; Meilisearch is projection
- Fallback: Postgres trigram if Meilisearch down (read-only degraded mode)

## Related

- [10-data-and-infra/02-meilisearch-indices.md](../10-data-and-infra/02-meilisearch-indices.md)
