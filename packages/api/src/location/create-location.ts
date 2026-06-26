import { eq } from "drizzle-orm";
import { getDb } from "@afterhive/db";
import { locations, tenants } from "@afterhive/db/schema";
import { normalizeLocationName, validateLocationName } from "./location-name";

export type CreateLocationInput = {
  tenantSlug: string;
  name: string;
};

export type CreateLocationResult = {
  locationId: string;
  name: string;
};

export class CreateLocationError extends Error {
  constructor(readonly code: "tenant_not_found" | "empty" | "too_long") {
    super(code);
    this.name = "CreateLocationError";
  }
}

export async function createLocation(input: CreateLocationInput): Promise<CreateLocationResult> {
  const validationError = validateLocationName(input.name);

  if (validationError) {
    throw new CreateLocationError(validationError);
  }

  const db = getDb();
  const name = normalizeLocationName(input.name);

  const [tenant] = await db
    .select({ id: tenants.id })
    .from(tenants)
    .where(eq(tenants.slug, input.tenantSlug))
    .limit(1);

  if (!tenant) {
    throw new CreateLocationError("tenant_not_found");
  }

  const [location] = await db
    .insert(locations)
    .values({
      tenantId: tenant.id,
      name,
    })
    .returning({ id: locations.id, name: locations.name });

  return {
    locationId: location.id,
    name: location.name,
  };
}
