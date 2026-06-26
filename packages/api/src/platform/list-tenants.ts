import { and, desc, eq, lt, or, type SQL } from "drizzle-orm";
import { getDb } from "@afterhive/db";
import { tenantSubscriptions, tenants } from "@afterhive/db/schema";

const DEFAULT_LIMIT = 20;
const MAX_LIMIT = 100;

export type TenantStatus = "trial" | "active" | "suspended" | "closed";

export type ListTenantsInput = {
  status?: TenantStatus;
  planId?: string;
  cursor?: string;
  limit?: number;
};

export type TenantListItem = {
  id: string;
  slug: string;
  name: string;
  status: TenantStatus;
  planId: string;
  subscriptionStatus: string;
  createdAt: string;
};

export type ListTenantsResult = {
  items: TenantListItem[];
  nextCursor: string | null;
};

function encodeCursor(createdAt: Date, id: string) {
  return Buffer.from(`${createdAt.toISOString()}|${id}`).toString("base64url");
}

function decodeCursor(cursor: string): { createdAt: Date; id: string } | null {
  try {
    const decoded = Buffer.from(cursor, "base64url").toString("utf8");
    const separatorIndex = decoded.lastIndexOf("|");

    if (separatorIndex === -1) {
      return null;
    }

    const createdAt = new Date(decoded.slice(0, separatorIndex));
    const id = decoded.slice(separatorIndex + 1);

    if (Number.isNaN(createdAt.getTime()) || !id) {
      return null;
    }

    return { createdAt, id };
  } catch {
    return null;
  }
}

export async function listTenants(input: ListTenantsInput = {}): Promise<ListTenantsResult> {
  const db = getDb();
  const limit = Math.min(Math.max(input.limit ?? DEFAULT_LIMIT, 1), MAX_LIMIT);
  const filters: SQL[] = [];

  if (input.status) {
    filters.push(eq(tenants.status, input.status));
  }

  if (input.planId) {
    filters.push(eq(tenantSubscriptions.planId, input.planId.trim()));
  }

  if (input.cursor) {
    const decoded = decodeCursor(input.cursor);

    if (!decoded) {
      return { items: [], nextCursor: null };
    }

    filters.push(
      or(
        lt(tenants.createdAt, decoded.createdAt),
        and(eq(tenants.createdAt, decoded.createdAt), lt(tenants.id, decoded.id)),
      )!,
    );
  }

  const rows = await db
    .select({
      id: tenants.id,
      slug: tenants.slug,
      name: tenants.name,
      status: tenants.status,
      planId: tenantSubscriptions.planId,
      subscriptionStatus: tenantSubscriptions.status,
      createdAt: tenants.createdAt,
    })
    .from(tenants)
    .innerJoin(tenantSubscriptions, eq(tenantSubscriptions.tenantId, tenants.id))
    .where(filters.length > 0 ? and(...filters) : undefined)
    .orderBy(desc(tenants.createdAt), desc(tenants.id))
    .limit(limit + 1);

  const hasMore = rows.length > limit;
  const pageRows = hasMore ? rows.slice(0, limit) : rows;

  const items: TenantListItem[] = pageRows.map((row) => ({
    id: row.id,
    slug: row.slug,
    name: row.name,
    status: row.status,
    planId: row.planId,
    subscriptionStatus: row.subscriptionStatus,
    createdAt: row.createdAt.toISOString(),
  }));

  const lastItem = pageRows.at(-1);
  const nextCursor =
    hasMore && lastItem ? encodeCursor(lastItem.createdAt, lastItem.id) : null;

  return { items, nextCursor };
}

export function parseTenantStatus(value: string | undefined): TenantStatus | undefined {
  switch (value) {
    case "trial":
    case "active":
    case "suspended":
    case "closed":
      return value;
    default:
      return undefined;
  }
}
