import { NextResponse } from "next/server";
import { getPortalSessionContext } from "@afterhive/api/auth/get-portal-session";

export async function GET(request: Request) {
  const tenantSlug = request.headers.get("x-tenant-slug");

  if (!tenantSlug) {
    return NextResponse.json({ error: "missing_tenant" }, { status: 400 });
  }

  const context = await getPortalSessionContext(tenantSlug, request.headers);

  if (!context) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  return NextResponse.json(context);
}
