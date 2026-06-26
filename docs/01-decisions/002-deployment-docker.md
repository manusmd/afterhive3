# ADR-002: Deployment — Docker Compose on Own Server

## Status

Accepted

## Context

MVP targets a single owned server (DACH), not managed PaaS. Four Next.js surface apps plus worker and data services must run reliably with simple ops.

## Decision

Deploy with **Docker Compose** on one host:

| Service | Role |
|---------|------|
| `nginx` (or Caddy) | Reverse proxy, TLS termination, path routing to surface apps |
| `platform` | Next.js — platform backoffice |
| `admin` | Next.js — tenant admin |
| `portal` | Next.js — member portal |
| `marketplace` | Next.js — public marketplace |
| `worker` | BullMQ consumer |
| `postgres` | Primary database |
| `redis` | Queue + session cache |
| `meilisearch` | Search |

All four web apps share env for database URL, Redis, R2, Meilisearch, and auth secrets. Each app has its own `PORT` and public `BASE_PATH` (or subdomain in post-MVP).

## Routing (MVP)

Path-based routing on one domain:

- `/platform/*` → platform container
- `/admin/*` → admin container
- `/portal/*` → portal container
- `/` → marketplace container

See [ADR-010](./010-routing-path-to-subdomain.md) for subdomain migration.

## Consequences

- Four Next.js build artifacts in CI/CD; nginx config must stay in sync with app base paths
- Horizontal scale later: replicate individual app containers behind load balancer
- No separate NestJS/API container

## Related

- [Docker Compose topology](../10-data-and-infra/05-docker-compose-topology.md)
- [App surfaces and repo](../00-overview/04-app-surfaces-and-repo.md)
