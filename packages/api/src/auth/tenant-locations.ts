import { listLocations } from "../location/list-locations";

export async function listTenantLocations(tenantSlug: string) {
  const locations = await listLocations(tenantSlug);
  return locations.map(({ id, name }) => ({ id, name }));
}
