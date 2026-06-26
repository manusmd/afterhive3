import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { nextCookies } from "better-auth/next-js";
import { getDb, schema } from "@afterhive/db";
import { getEnv } from "@afterhive/shared/env";

function getAdminAuthUrls() {
  const publicAppUrl = (
    process.env.ADMIN_APP_URL ??
    `${process.env.APP_URL ?? "http://localhost:3002"}/app`
  ).replace(/\/$/, "");
  const origin = new URL(publicAppUrl).origin;

  return {
    publicAppUrl,
    handlerBaseURL: `${origin}/api/auth`,
    publicAuthUrl: `${publicAppUrl}/api/auth`,
  };
}

export function createAdminAuth() {
  const env = getEnv();
  const db = getDb();
  const { publicAppUrl, handlerBaseURL, publicAuthUrl } = getAdminAuthUrls();
  const origin = new URL(publicAppUrl).origin;

  return betterAuth({
    baseURL: handlerBaseURL,
    secret: env.BETTER_AUTH_SECRET,
    database: drizzleAdapter(db, {
      provider: "pg",
      schema: {
        user: schema.user,
        session: schema.session,
        account: schema.account,
        verification: schema.verification,
      },
      camelCase: true,
    }),
    emailAndPassword: {
      enabled: true,
    },
    plugins: [nextCookies()],
    trustedOrigins: [origin, publicAppUrl, publicAuthUrl, env.APP_URL],
  });
}

let adminAuth: ReturnType<typeof createAdminAuth> | null = null;

export function getAdminAuth() {
  if (!adminAuth) {
    adminAuth = createAdminAuth();
  }
  return adminAuth;
}

export function getAdminPublicAuthUrl() {
  return getAdminAuthUrls().publicAuthUrl;
}

export type AdminAuth = ReturnType<typeof createAdminAuth>;
