import { NextResponse } from "next/server";
import { getAdminSessionContext } from "@afterhive/api/auth/get-admin-session";
import { canEndEnrollment } from "@afterhive/api/enrollment/can-end-enrollment";
import {
  EndEnrollmentError,
  endEnrollment,
  type EndEnrollmentReason,
} from "@afterhive/api/enrollment/end-enrollment";

type RouteContext = {
  params: Promise<{ enrollmentId: string }>;
};

type EndEnrollmentBody = {
  reason?: EndEnrollmentReason;
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

  if (!canEndEnrollment(session.roles, session.locationIds, session.roleAssignments)) {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }

  const { enrollmentId } = await context.params;

  if (!enrollmentId) {
    return NextResponse.json({ error: "missing_enrollment" }, { status: 400 });
  }

  let body: EndEnrollmentBody = {};

  try {
    body = (await request.json()) as EndEnrollmentBody;
  } catch {
    body = {};
  }

  if (body.reason !== undefined && typeof body.reason !== "string") {
    return NextResponse.json({ error: "invalid_body" }, { status: 400 });
  }

  try {
    const result = await endEnrollment(session, tenantSlug, enrollmentId, body);
    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    if (error instanceof EndEnrollmentError) {
      switch (error.code) {
        case "tenant_not_found":
        case "enrollment_not_found":
          return NextResponse.json({ error: error.code }, { status: 404 });
        case "forbidden":
        case "location_forbidden":
          return NextResponse.json({ error: error.code }, { status: 403 });
        case "invalid_status":
        case "invalid_reason":
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
