# ADR-006: Background Jobs — BullMQ

## Status

Accepted

## Context

Async work: email, invoice batches, Meilisearch sync, imports, dunning, webhooks.

## Decision

- **Queue:** BullMQ on Redis
- **Worker:** Separate Docker service (`worker` entrypoint)
- **Queues:** `default`, `email`, `billing`, `search`, `imports`, `webhooks`
- **Idempotency:** `jobId` = deterministic hash of `(queue, entityType, entityId, action)` where applicable
- **Retries:** 3 attempts, exponential backoff; failed jobs to dead-letter collection

## Consequences

- Domain events enqueue jobs; handlers idempotent
- Job catalog: [09-api-and-events/04-background-jobs.md](../09-api-and-events/04-background-jobs.md)

## Related

- [002-deployment-docker.md](002-deployment-docker.md)
