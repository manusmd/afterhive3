# Sentry, Pino, and Health Checks

## Purpose

Observability MVP stack.

## Sentry

- `@sentry/nextjs` in web, worker
- Tags: `tenant_id`, `user_id`, `request_id`, `surface`
- Performance: sample rate 0.1 MVP
- PII scrubbing before send

## Pino structured logs

- JSON stdout
- Levels: info default, warn business rule blocks, error exceptions
- Child logger per request with context

## Health check

`GET /api/health`:

```json
{
  "status": "ok",
  "checks": {
    "postgres": "ok",
    "redis": "ok",
    "meilisearch": "ok"
  }
}
```

503 if any critical check fails

## Metrics (post-MVP)

Prometheus endpoint optional; not MVP

## Related

[02-logging-redaction-rules.md](02-logging-redaction-rules.md)
