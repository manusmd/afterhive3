import { existsSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { config as loadDotenv } from "dotenv";
import { z } from "zod";

function loadRootEnv(): void {
  if (process.env.DATABASE_URL) return;
  let dir = process.cwd();
  for (let i = 0; i < 6; i += 1) {
    const envPath = resolve(dir, ".env");
    if (existsSync(envPath)) {
      loadDotenv({ path: envPath });
      return;
    }
    const parent = dirname(dir);
    if (parent === dir) return;
    dir = parent;
  }
}

const envSchema = z.object({
  DATABASE_URL: z.string().url(),
  REDIS_URL: z.string().min(1),
  MEILI_HOST: z.string().url(),
  MEILI_MASTER_KEY: z.string().min(1),
  BETTER_AUTH_SECRET: z.string().min(32),
  APP_URL: z.string().url(),
  SENTRY_DSN: z.string().url().optional().or(z.literal("")),
  SENTRY_ENVIRONMENT: z.string().default("development"),
  NODE_ENV: z
    .enum(["development", "production", "test"])
    .default("development"),
});

export type Env = z.infer<typeof envSchema>;

let cached: Env | null = null;

export function getEnv(): Env {
  if (cached) return cached;
  loadRootEnv();
  cached = envSchema.parse(process.env);
  return cached;
}

export function getEnvSafe(): Env | null {
  try {
    return getEnv();
  } catch {
    return null;
  }
}
