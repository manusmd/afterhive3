import { NextResponse } from "next/server";
import { getAdminSessionContext } from "@afterhive/api/auth/get-admin-session";
import { canConvertLead } from "@afterhive/api/crm/can-convert-lead";
import { ConvertLeadError, convertLead } from "@afterhive/api/crm/convert-lead";

type RouteContext = {
  params: Promise<{ leadId: string }>;
};

export async function POST(request: Request, context: RouteContext) {
  const tenantSlug = request.headers.get("x-tenant-slug");

  if (!tenantSlug) {
    return NextResponse.json({ error: "missing_tenant" }, { status: 400 });
  }

  const session = await getAdminSessionContext(tenantSlug, request.headers);

  if (!session) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  if (!canConvertLead(session.roles, session.locationIds, session.roleAssignments)) {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }

  const { leadId } = await context.params;

  if (!leadId) {
    return NextResponse.json({ error: "missing_lead" }, { status: 400 });
  }

  try {
    const result = await convertLead(session, tenantSlug, leadId);
    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    if (error instanceof ConvertLeadError) {
      const status =
        error.code === "tenant_not_found" || error.code === "lead_not_found"
          ? 404
          : error.code === "location_forbidden"
            ? 403
            : 400;
      return NextResponse.json({ error: error.code }, { status });
    }

    throw error;
  }
}
