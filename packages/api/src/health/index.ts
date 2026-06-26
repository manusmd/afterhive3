import { sql } from "drizzle-orm";
import { Redis } from "ioredis";
import { getDb } from "@afterhive/db";
import { getEnvSafe } from "@afterhive/shared/env";

export type HealthCheckName = "postgres" | "redis" | "meilisearch";

export type HealthChecks = Record<HealthCheckName, "ok" | "error">;

export type HealthResponse = {
  status: "ok" | "error";
  checks: HealthChecks;
};

async function checkPostgres(): Promise<boolean> {
  try {
    const db = getDb();
    await db.execute(sql`select 1`);
    return true;
  } catch {
    return false;
  }
}

async function checkRedis(redisUrl: string): Promise<boolean> {
  const redis = new Redis(redisUrl, {
    maxRetriesPerRequest: 1,
    connectTimeout: 3000,
    lazyConnect: true,
  });
  try {
    await redis.connect();
    const pong = await redis.ping();
    return pong === "PONG";
  } catch {
    return false;
  } finally {
    redis.disconnect();
  }
}

async function checkMeilisearch(host: string, masterKey: string): Promise<boolean> {
  try {
    const response = await fetch(`${host}/health`, {
      headers: { Authorization: `Bearer ${masterKey}` },
      signal: AbortSignal.timeout(3000),
    });
    return response.ok;
  } catch {
    return false;
  }
}

export async function runHealthChecks(): Promise<HealthResponse> {
  const env = getEnvSafe();
  const checks: HealthChecks = {
    postgres: "error",
    redis: "error",
    meilisearch: "error",
  };

  if (!env) {
    return { status: "error", checks };
  }

  checks.postgres = (await checkPostgres()) ? "ok" : "error";
  checks.redis = (await checkRedis(env.REDIS_URL)) ? "ok" : "error";
  checks.meilisearch = (await checkMeilisearch(env.MEILI_HOST, env.MEILI_MASTER_KEY))
    ? "ok"
    : "error";

  const status = Object.values(checks).every((value) => value === "ok")
    ? "ok"
    : "error";

  return { status, checks };
}

export function healthStatusCode(response: HealthResponse): number {
  return response.status === "ok" ? 200 : 503;
}
