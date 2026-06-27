import { NextResponse } from "next/server";
import { getAdminSessionContext } from "@afterhive/api/auth/get-admin-session";
import { canManageClubRoster } from "@afterhive/api/club/can-access-club-sport";
import { UpdateRosterError, updateRoster } from "@afterhive/api/club/update-roster";

type UpdateRosterBody = {
  entries?: Array<{
    memberProfileId?: string;
    jerseyNumber?: string | null;
  }>;
};

export async function POST(
  request: Request,
  context: { params: Promise<{ teamId: string }> },
) {
  const tenantSlug = request.headers.get("x-tenant-slug");

  if (!tenantSlug) {
    return NextResponse.json({ error: "missing_tenant" }, { status: 400 });
  }

  const session = await getAdminSessionContext(tenantSlug, request.headers);

  if (!session) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  if (!(await canManageClubRoster(session))) {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }

  const { teamId } = await context.params;

  let body: UpdateRosterBody;

  try {
    body = (await request.json()) as UpdateRosterBody;
  } catch {
    return NextResponse.json({ error: "invalid_body" }, { status: 400 });
  }

  if (!Array.isArray(body.entries)) {
    return NextResponse.json({ error: "invalid_body" }, { status: 400 });
  }

  const entries = body.entries.map((entry) => ({
    memberProfileId: entry.memberProfileId ?? "",
    jerseyNumber: entry.jerseyNumber ?? null,
  }));

  try {
    await updateRoster(session, tenantSlug, { teamId, entries });
    return NextResponse.json({ ok: true });
  } catch (error) {
    if (error instanceof UpdateRosterError) {
      switch (error.code) {
        case "tenant_not_found":
        case "team_not_found":
        case "member_not_found":
          return NextResponse.json({ error: error.code }, { status: 404 });
        case "forbidden":
        case "location_forbidden":
          return NextResponse.json({ error: error.code }, { status: 403 });
        case "duplicate_member":
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
