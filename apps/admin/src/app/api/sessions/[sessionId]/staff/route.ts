import { NextResponse } from "next/server";
import { getAdminSessionContext } from "@afterhive/api/auth/get-admin-session";
import { canAssignSessionStaff } from "@afterhive/api/schedule/can-assign-session-staff";
import {
  AssignSessionStaffError,
  assignSessionStaff,
} from "@afterhive/api/schedule/assign-session-staff";

type RouteContext = {
  params: Promise<{ sessionId: string }>;
};

type AssignSessionStaffBody = {
  userId?: string;
  role?: "lead" | "assistant";
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

  if (!canAssignSessionStaff(session.roles, session.locationIds, session.roleAssignments)) {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }

  const { sessionId } = await context.params;

  if (!sessionId) {
    return NextResponse.json({ error: "missing_session" }, { status: 400 });
  }

  let body: AssignSessionStaffBody;

  try {
    body = (await request.json()) as AssignSessionStaffBody;
  } catch {
    return NextResponse.json({ error: "invalid_body" }, { status: 400 });
  }

  if (typeof body.userId !== "string") {
    return NextResponse.json({ error: "invalid_body" }, { status: 400 });
  }

  try {
    const result = await assignSessionStaff(session, tenantSlug, sessionId, {
      userId: body.userId,
      role: body.role,
    });

    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    if (error instanceof AssignSessionStaffError) {
      switch (error.code) {
        case "tenant_not_found":
        case "session_not_found":
        case "staff_not_found":
          return NextResponse.json({ error: error.code }, { status: 404 });
        case "forbidden":
        case "location_forbidden":
          return NextResponse.json({ error: error.code }, { status: 403 });
        case "staff_double_book":
        case "already_assigned":
          return NextResponse.json({ error: error.code }, { status: 409 });
        case "missing_fields":
          return NextResponse.json({ error: error.code }, { status: 400 });
        default: {
          const _exhaustive: never = error.code;
          return NextResponse.json({ error: _exhaustive }, { status: 400 });
        }
      }
    }

    throw error;
  }
}
