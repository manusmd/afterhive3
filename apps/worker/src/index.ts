import { createLogger } from "@afterhive/shared/logger";
import { getEnv } from "@afterhive/shared/env";
import { Redis } from "ioredis";

const log = createLogger("worker");

async function main() {
  const env = getEnv();

  if (env.SENTRY_DSN) {
    const Sentry = await import("@sentry/node");
    Sentry.init({
      dsn: env.SENTRY_DSN,
      environment: env.SENTRY_ENVIRONMENT,
      tracesSampleRate: 0.1,
    });
  }

  const redis = new Redis(env.REDIS_URL);
  await redis.ping();
  log.info({ surface: "worker" }, "worker ready");

  const shutdown = async (signal: string) => {
    log.info({ signal }, "shutting down");
    await redis.quit();
    process.exit(0);
  };

  process.on("SIGINT", () => void shutdown("SIGINT"));
  process.on("SIGTERM", () => void shutdown("SIGTERM"));
}

main().catch((error) => {
  log.error({ err: error }, "worker failed to start");
  process.exit(1);
});
