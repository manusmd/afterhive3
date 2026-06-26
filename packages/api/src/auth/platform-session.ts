import { and, eq } from "drizzle-orm";
import { getDb } from "@afterhive/db";
import { platformMemberships } from "@afterhive/db/schema";
import type { SessionContext } from "@afterhive/domain";

export async function resolvePlatformSession(userId: string): Promise<SessionContext | null> {
  const db = getDb();

  const [membership] = await db
    .select({
      role: platformMemberships.role,
    })
    .from(platformMemberships)
    .where(
      and(eq(platformMemberships.userId, userId), eq(platformMemberships.status, "active")),
    )
    .limit(1);

  if (!membership) {
    return null;
  }

  return {
    userId,
    surface: "platform",
    roles: [membership.role],
  };
}
