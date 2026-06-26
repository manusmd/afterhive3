import { and, desc, eq, isNull } from "drizzle-orm";
import { getDb } from "@afterhive/db";
import { persons } from "@afterhive/db/schema";
import type { SessionContext } from "@afterhive/domain";

export type PersonListItem = {
  id: string;
  firstName: string;
  lastName: string;
  createdAt: string;
};

export async function listPersons(session: SessionContext): Promise<PersonListItem[]> {
  if (!session.tenantId) {
    return [];
  }

  const db = getDb();
  const rows = await db
    .select({
      id: persons.id,
      firstName: persons.firstName,
      lastName: persons.lastName,
      createdAt: persons.createdAt,
    })
    .from(persons)
    .where(and(eq(persons.tenantId, session.tenantId), isNull(persons.deletedAt)))
    .orderBy(desc(persons.createdAt));

  return rows.map((row) => ({
    id: row.id,
    firstName: row.firstName,
    lastName: row.lastName,
    createdAt: row.createdAt.toISOString(),
  }));
}
