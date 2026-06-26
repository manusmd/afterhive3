import { getEnv } from "@afterhive/shared/env";
import { migrate } from "drizzle-orm/postgres-js/migrator";
import postgres from "postgres";
import { drizzle } from "drizzle-orm/postgres-js";
import { fileURLToPath } from "node:url";
import path from "node:path";

const migrationsFolder = path.join(
  path.dirname(fileURLToPath(import.meta.url)),
  "../drizzle",
);

async function main() {
  const { DATABASE_URL } = getEnv();
  const sql = postgres(DATABASE_URL, { max: 1 });
  const db = drizzle(sql);
  await migrate(db, { migrationsFolder });
  await sql.end();
  console.log("Migrations applied");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
