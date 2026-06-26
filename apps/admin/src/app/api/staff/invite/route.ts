import { NextResponse } from "next/server";
import { canAssignRoles } from "@afterhive/api/auth/can-assign-roles";
import { getAdminSessionContext } from "@afterhive/api/auth/get-admin-session";
import { InviteStaffError, inviteStaff } from "@afterhive/api/auth/invite-staff";

type InviteStaffBody = {
  email?: string;
  role?: string;
  locationIds?: string[];
};

export async function POST(request: Request) {
  const tenantSlug = request.headers.get("x-tenant-slug");

  if (!tenantSlug) {
    return NextResponse.json({ error: "missing_tenant" }, { status: 400 });
  }

  const session = await getAdminSessionContext(tenantSlug, request.headers);

  if (!session || !canAssignRoles(session.roles)) {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }

  let body: InviteStaffBody;

  try {
    body = (await request.json()) as InviteStaffBody;
  } catch {
    return NextResponse.json({ error: "invalid_body" }, { status: 400 });
  }

  if (!body.email || !body.role) {
    return NextResponse.json({ error: "missing_fields" }, { status: 400 });
  }

  try {
    const result = await inviteStaff({
      tenantSlug,
      email: body.email,
      role: body.role,
      locationIds: body.locationIds,
      invitedByUserId: session.userId,
    });

    return NextResponse.json(result);
  } catch (error) {
    if (error instanceof InviteStaffError) {
      const status =
        error.code === "tenant_not_found"
          ? 404
          : error.code === "locations_required"
            ? 400
            : 409;
      return NextResponse.json({ error: error.code }, { status });
    }

    throw error;
  }
}
