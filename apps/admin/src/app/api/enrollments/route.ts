import { NextResponse } from "next/server";
import { getAdminSessionContext } from "@afterhive/api/auth/get-admin-session";
import { canEnrollMember } from "@afterhive/api/enrollment/can-enroll-member";
import { EnrollMemberError, enrollMember } from "@afterhive/api/enrollment/enroll-member";

type EnrollMemberBody = {
  memberProfileId?: string;
  offerGroupId?: string;
};

export async function POST(request: Request) {
  const tenantSlug = request.headers.get("x-tenant-slug");

  if (!tenantSlug) {
    return NextResponse.json({ error: "missing_tenant" }, { status: 400 });
  }

  const session = await getAdminSessionContext(tenantSlug, request.headers);

  if (!session) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  if (!canEnrollMember(session.roles, session.locationIds, session.roleAssignments)) {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }

  let body: EnrollMemberBody;

  try {
    body = (await request.json()) as EnrollMemberBody;
  } catch {
    return NextResponse.json({ error: "invalid_body" }, { status: 400 });
  }

  if (typeof body.memberProfileId !== "string" || typeof body.offerGroupId !== "string") {
    return NextResponse.json({ error: "invalid_body" }, { status: 400 });
  }

  if (!body.memberProfileId.trim() || !body.offerGroupId.trim()) {
    return NextResponse.json({ error: "missing_fields" }, { status: 400 });
  }

  try {
    const result = await enrollMember(session, tenantSlug, {
      memberProfileId: body.memberProfileId,
      offerGroupId: body.offerGroupId,
    });

    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    if (error instanceof EnrollMemberError) {
      switch (error.code) {
        case "tenant_not_found":
        case "member_not_found":
        case "offer_group_not_found":
          return NextResponse.json({ error: error.code }, { status: 404 });
        case "forbidden":
        case "location_forbidden":
          return NextResponse.json({ error: error.code }, { status: 403 });
        case "group_full":
        case "group_closed":
        case "already_enrolled":
        case "already_waitlisted":
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
