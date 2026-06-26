# Backup and Restore

## Purpose

Operator backup strategy for Docker MVP.

## PostgreSQL

- Daily `pg_dump -Fc` to off-server storage
- Retention: 30 daily, 12 monthly
- RPO: 24h; RTO: 4h (manual restore)

## Redis

- RDB snapshots optional; jobs can replay from events (acceptable MVP loss <1h)

## Meilisearch

- Rebuild from Postgres via JOB-meilisearch-reindex after restore

## R2

- Cloudflare durability; enable versioning on bucket

## Restore procedure

1. Stop web + worker
2. Restore postgres dump
3. Start meilisearch, run full reindex
4. Start services
5. Verify health + sample tenant login

## Test

Quarterly restore drill to staging
