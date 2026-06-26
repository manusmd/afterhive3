import { NextResponse } from "next/server";
import { getAdminSessionContext } from "@afterhive/api/auth/get-admin-session";
import {
  ActivateEnrollmentError,
  activateEnrollment,
} from "@afterhive/api/enrollment/activate-enrollment";

const ENROLLMENT_ACTIVATORS = new Set(["tenant_owner", "tenant_admin"]);

type RouteContext = {
  params: Promise<{ enrollmentId: string }>;
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

  if (!session.roles.some((role) => ENROLLMENT_ACTIVATORS.has(role))) {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }

  const { enrollmentId } = await context.params;

  if (!enrollmentId) {
    return NextResponse.json({ error: "missing_enrollment" }, { status: 400 });
  }

  try {
    const result = await activateEnrollment(session, tenantSlug, enrollmentId);
    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    if (error instanceof ActivateEnrollmentError) {
      switch (error.code) {
        case "tenant_not_found":
        case "enrollment_not_found":
          return NextResponse.json({ error: error.code }, { status: 404 });
        case "consent_required":
          return NextResponse.json({ error: error.code }, { status: 403 });
        case "group_full":
          return NextResponse.json({ error: error.code }, { status: 409 });
        case "invalid_status":
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
