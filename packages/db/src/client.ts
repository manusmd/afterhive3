import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { getEnv } from "@afterhive/shared/env";
import * as schema from "./schema";

export type Db = ReturnType<typeof createDb>;

let client: postgres.Sql | null = null;
let db: Db | null = null;

export function createDb(connectionString: string) {
  const sql = postgres(connectionString, { max: 10 });
  return drizzle(sql, { schema });
}

export function getDb(connectionString?: string): Db {
  const url = connectionString ?? getEnv().DATABASE_URL;
  if (!url) {
    throw new Error("DATABASE_URL is required");
  }
  if (!db) {
    client = postgres(url, { max: 10 });
    db = drizzle(client, { schema });
  }
  return db;
}

export async function closeDb(): Promise<void> {
  if (client) {
    await client.end();
    client = null;
    db = null;
  }
}

export { schema };
