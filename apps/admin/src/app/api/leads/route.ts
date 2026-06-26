import { NextResponse } from "next/server";
import { getAdminSessionContext } from "@afterhive/api/auth/get-admin-session";
import { canReadLeads } from "@afterhive/api/crm/can-read-leads";
import { listLeads } from "@afterhive/api/crm/list-leads";

export async function GET(request: Request) {
  const tenantSlug = request.headers.get("x-tenant-slug");

  if (!tenantSlug) {
    return NextResponse.json({ error: "missing_tenant" }, { status: 400 });
  }

  const session = await getAdminSessionContext(tenantSlug, request.headers);

  if (!session || !canReadLeads(session.roles)) {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }

  const items = await listLeads(session);
  return NextResponse.json({ items });
}
