import { NextResponse } from "next/server";
import { canCreateLocation, canViewLocations } from "@afterhive/api/location/can-manage-locations";
import { CreateLocationError, createLocation } from "@afterhive/api/location/create-location";
import { listLocations } from "@afterhive/api/location/list-locations";
import { getAdminSessionContext } from "@afterhive/api/auth/get-admin-session";

export async function GET(request: Request) {
  const tenantSlug = request.headers.get("x-tenant-slug");

  if (!tenantSlug) {
    return NextResponse.json({ error: "missing_tenant" }, { status: 400 });
  }

  const session = await getAdminSessionContext(tenantSlug, request.headers);

  if (!session || !canViewLocations(session.roles)) {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }

  const items = await listLocations(tenantSlug);
  return NextResponse.json({ items });
}

export async function POST(request: Request) {
  const tenantSlug = request.headers.get("x-tenant-slug");

  if (!tenantSlug) {
    return NextResponse.json({ error: "missing_tenant" }, { status: 400 });
  }

  const session = await getAdminSessionContext(tenantSlug, request.headers);

  if (!session || !canCreateLocation(session.roles)) {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }

  let body: { name?: string };

  try {
    body = (await request.json()) as { name?: string };
  } catch {
    return NextResponse.json({ error: "invalid_body" }, { status: 400 });
  }

  if (!body.name) {
    return NextResponse.json({ error: "missing_fields" }, { status: 400 });
  }

  try {
    const result = await createLocation({
      tenantSlug,
      name: body.name,
    });

    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    if (error instanceof CreateLocationError) {
      const status = error.code === "tenant_not_found" ? 404 : 400;
      return NextResponse.json({ error: error.code }, { status });
    }

    throw error;
  }
}
