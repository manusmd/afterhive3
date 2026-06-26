import { NextResponse } from "next/server";
import { getAdminSessionContext } from "@afterhive/api/auth/get-admin-session";
import { canCreateLead } from "@afterhive/api/crm/can-create-lead";
import { canReadLeads } from "@afterhive/api/crm/can-read-leads";
import { CreateLeadError, createLead } from "@afterhive/api/crm/create-lead";
import { listLeads } from "@afterhive/api/crm/list-leads";

type CreateLeadBody = {
  firstName?: string;
  lastName?: string;
  locationId?: string;
  source?: string;
};

export async function GET(request: Request) {
  const tenantSlug = request.headers.get("x-tenant-slug");

  if (!tenantSlug) {
    return NextResponse.json({ error: "missing_tenant" }, { status: 400 });
  }

  const session = await getAdminSessionContext(tenantSlug, request.headers);

  if (!session) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  if (!canReadLeads(session.roles, session.locationIds)) {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }

  const items = await listLeads(session);
  return NextResponse.json({ items });
}

export async function POST(request: Request) {
  const tenantSlug = request.headers.get("x-tenant-slug");

  if (!tenantSlug) {
    return NextResponse.json({ error: "missing_tenant" }, { status: 400 });
  }

  const session = await getAdminSessionContext(tenantSlug, request.headers);

  if (!session) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  if (!canCreateLead(session.roles, session.locationIds)) {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }

  let body: CreateLeadBody;

  try {
    body = (await request.json()) as CreateLeadBody;
  } catch {
    return NextResponse.json({ error: "invalid_body" }, { status: 400 });
  }

  if (!body.firstName || !body.lastName || !body.locationId) {
    return NextResponse.json({ error: "missing_fields" }, { status: 400 });
  }

  try {
    const result = await createLead(session, tenantSlug, {
      firstName: body.firstName,
      lastName: body.lastName,
      locationId: body.locationId,
      source: body.source,
    });

    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    if (error instanceof CreateLeadError) {
      const status =
        error.code === "tenant_not_found"
          ? 404
          : error.code === "location_forbidden"
            ? 403
            : 400;
      return NextResponse.json({ error: error.code }, { status });
    }

    throw error;
  }
}
