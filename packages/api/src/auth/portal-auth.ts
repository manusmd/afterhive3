import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { nextCookies } from "better-auth/next-js";
import { getDb, schema } from "@afterhive/db";
import { getEnv } from "@afterhive/shared/env";

function getPortalAuthUrls() {
  const publicAppUrl = (
    process.env.PORTAL_APP_URL ?? "http://localhost:3003/portal"
  ).replace(/\/$/, "");
  const origin = new URL(publicAppUrl).origin;

  return {
    publicAppUrl,
    handlerBaseURL: `${origin}/api/auth`,
    publicAuthUrl: `${publicAppUrl}/api/auth`,
  };
}

export function createPortalAuth() {
  const env = getEnv();
  const db = getDb();
  const { publicAppUrl, handlerBaseURL, publicAuthUrl } = getPortalAuthUrls();
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

let portalAuth: ReturnType<typeof createPortalAuth> | null = null;

export function getPortalAuth() {
  if (!portalAuth) {
    portalAuth = createPortalAuth();
  }
  return portalAuth;
}

export type PortalAuth = ReturnType<typeof createPortalAuth>;
