import { and, eq } from "drizzle-orm";
import { getDb } from "@afterhive/db";
import { offers, tenants } from "@afterhive/db/schema";
import type { SessionContext } from "@afterhive/domain";
import {
  buildLocationScopeFilter,
  hasNoLocationAccess,
} from "../location/location-scope";

export type OfferListItem = {
  offerId: string;
  name: string;
  type: string;
  status: string;
  locationId: string;
  createdAt: string;
};

export async function listOffers(
  session: SessionContext,
  tenantSlug: string,
): Promise<OfferListItem[]> {
  if (!session.tenantId || hasNoLocationAccess(session.locationIds)) {
    return [];
  }

  const db = getDb();
  const conditions = [eq(tenants.slug, tenantSlug), eq(offers.tenantId, session.tenantId)];
  const scopeFilter = buildLocationScopeFilter(offers.locationId, session.locationIds);

  if (scopeFilter) {
    conditions.push(scopeFilter);
  }

  const rows = await db
    .select({
      offerId: offers.id,
      name: offers.name,
      type: offers.type,
      status: offers.status,
      locationId: offers.locationId,
      createdAt: offers.createdAt,
    })
    .from(offers)
    .innerJoin(tenants, eq(offers.tenantId, tenants.id))
    .where(and(...conditions));

  return rows.map((row) => ({
    offerId: row.offerId,
    name: row.name,
    type: row.type,
    status: row.status,
    locationId: row.locationId,
    createdAt: row.createdAt.toISOString(),
  }));
}
