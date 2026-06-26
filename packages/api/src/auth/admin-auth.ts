import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { nextCookies } from "better-auth/next-js";
import { getDb, schema } from "@afterhive/db";
import { getEnv } from "@afterhive/shared/env";

export function createAdminAuth(baseURL: string) {
  const env = getEnv();
  const db = getDb();

  return betterAuth({
    baseURL,
    basePath: "/api/auth",
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
    trustedOrigins: [env.APP_URL, baseURL.replace(/\/app$/, "")],
  });
}

let adminAuth: ReturnType<typeof createAdminAuth> | null = null;

export function getAdminAuth() {
  if (!adminAuth) {
    const baseURL =
      process.env.ADMIN_APP_URL ??
      `${process.env.APP_URL ?? "http://localhost:3002"}/app`;
    adminAuth = createAdminAuth(baseURL);
  }
  return adminAuth;
}

export type AdminAuth = ReturnType<typeof createAdminAuth>;
