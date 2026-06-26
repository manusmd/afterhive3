# Docker Compose Topology

## Purpose

MVP deployment layout: four Next.js surface apps, worker, data services, reverse proxy.

## Services

```yaml
services:
  nginx:
    image: nginx:alpine
    ports: ["80:80", "443:443"]
    volumes: [./nginx.conf:/etc/nginx/nginx.conf]
    depends_on: [platform, admin, portal, marketplace]

  platform:
    build: .
    command: node apps/platform/server.js
    environment:
      PORT: 3001
      BASE_PATH: /platform
    env_file: .env
    depends_on: [postgres, redis, meilisearch]

  admin:
    build: .
    command: node apps/admin/server.js
    environment:
      PORT: 3002
      BASE_PATH: /app
    env_file: .env
    depends_on: [postgres, redis, meilisearch]

  portal:
    build: .
    command: node apps/portal/server.js
    environment:
      PORT: 3003
      BASE_PATH: /portal
    env_file: .env
    depends_on: [postgres, redis, meilisearch]

  marketplace:
    build: .
    command: node apps/marketplace/server.js
    environment:
      PORT: 3004
      BASE_PATH: /discover
    env_file: .env
    depends_on: [postgres, redis, meilisearch]

  worker:
    build: .
    command: node apps/worker/index.js
    env_file: .env
    depends_on: [postgres, redis, meilisearch]

  postgres:
    image: postgres:16
    volumes: [pgdata:/var/lib/postgresql/data]
    environment:
      POSTGRES_DB: afterhive
      POSTGRES_USER: afterhive
      POSTGRES_PASSWORD: ${POSTGRES_PASSWORD}

  redis:
    image: redis:7
    volumes: [redisdata:/data]

  meilisearch:
    image: getmeili/meilisearch:v1.11
    environment:
      MEILI_MASTER_KEY: ${MEILI_MASTER_KEY}
    volumes: [meilidata:/meili_data]

volumes:
  pgdata:
  redisdata:
  meilidata:
```

## nginx routing (conceptual)

| Location | Upstream |
|----------|----------|
| `/platform/` | `platform:3001` |
| `/app/` | `admin:3002` |
| `/portal/` | `portal:3003` |
| `/discover/` | `marketplace:3004` |

WebSocket upgrade for chat: proxy `/ws/chat` on admin and portal upstreams.

## Environment variables

| Var | Required | Description |
|-----|----------|-------------|
| DATABASE_URL | yes | postgres connection |
| REDIS_URL | yes | redis connection |
| MEILI_HOST, MEILI_MASTER_KEY | yes | search |
| R2_ACCOUNT_ID, R2_ACCESS_KEY, R2_SECRET_KEY, R2_BUCKET | yes | storage |
| BETTER_AUTH_SECRET | yes | auth (shared across apps) |
| STRIPE_SECRET_KEY, STRIPE_WEBHOOK_SECRET | yes | platform billing |
| SENTRY_DSN | yes | errors |
| EMAIL_API_KEY | yes | when provider chosen |
| APP_URL | yes | https://your-domain (public origin) |

Per-app optional: `BASE_PATH`, `PORT` (see service blocks).

## Volumes

`pgdata`, `redisdata`, `meilidata` — backup pgdata per [07-backup-restore.md](07-backup-restore.md)

## Health

Each app exposes `GET {basePath}/api/health` checking postgres, redis, meilisearch connectivity.

## Related

- [App surfaces and repo](../00-overview/04-app-surfaces-and-repo.md)
- [ADR-002](../01-decisions/002-deployment-docker.md)
