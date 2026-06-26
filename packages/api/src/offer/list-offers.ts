import { and, eq } from "drizzle-orm";
import { getDb } from "@afterhive/db";
import { offers, tenants } from "@afterhive/db/schema";

export type OfferListItem = {
  offerId: string;
  name: string;
  type: string;
  status: string;
  locationId: string;
  createdAt: string;
};

export async function listOffers(tenantSlug: string): Promise<OfferListItem[]> {
  const db = getDb();

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
    .where(eq(tenants.slug, tenantSlug));

  return rows.map((row) => ({
    offerId: row.offerId,
    name: row.name,
    type: row.type,
    status: row.status,
    locationId: row.locationId,
    createdAt: row.createdAt.toISOString(),
  }));
}
