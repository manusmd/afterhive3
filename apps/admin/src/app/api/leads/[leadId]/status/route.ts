import { NextResponse } from "next/server";
import { getAdminSessionContext } from "@afterhive/api/auth/get-admin-session";
import { canUpdateLeadStatus } from "@afterhive/api/crm/can-update-lead";
import {
  UpdateLeadStatusError,
  updateLeadStatus,
} from "@afterhive/api/crm/update-lead-status";

type RouteContext = {
  params: Promise<{ leadId: string }>;
};

type UpdateLeadStatusBody = {
  status?: string;
  lostReason?: string;
};

export async function PATCH(request: Request, context: RouteContext) {
  const tenantSlug = request.headers.get("x-tenant-slug");

  if (!tenantSlug) {
    return NextResponse.json({ error: "missing_tenant" }, { status: 400 });
  }

  const session = await getAdminSessionContext(tenantSlug, request.headers);

  if (!session) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  if (!canUpdateLeadStatus(session.roles, session.locationIds, session.roleAssignments)) {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }

  const { leadId } = await context.params;

  if (!leadId) {
    return NextResponse.json({ error: "missing_lead" }, { status: 400 });
  }

  let body: UpdateLeadStatusBody;

  try {
    body = (await request.json()) as UpdateLeadStatusBody;
  } catch {
    return NextResponse.json({ error: "invalid_body" }, { status: 400 });
  }

  if (typeof body.status !== "string") {
    return NextResponse.json({ error: "invalid_body" }, { status: 400 });
  }

  try {
    const result = await updateLeadStatus(session, tenantSlug, leadId, {
      status: body.status,
      lostReason: body.lostReason,
    });
    return NextResponse.json(result);
  } catch (error) {
    if (error instanceof UpdateLeadStatusError) {
      const status =
        error.code === "tenant_not_found" || error.code === "lead_not_found"
          ? 404
          : error.code === "location_forbidden" || error.code === "reopen_forbidden"
            ? 403
            : 400;
      return NextResponse.json({ error: error.code }, { status });
    }

    throw error;
  }
}
