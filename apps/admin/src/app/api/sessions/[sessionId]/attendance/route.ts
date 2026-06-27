import { NextResponse } from "next/server";
import { getAdminSessionContext } from "@afterhive/api/auth/get-admin-session";
import {
  RecordBulkAttendanceError,
  recordBulkAttendance,
} from "@afterhive/api/attendance/record-bulk-attendance";

type RecordAttendanceBody = {
  records?: Array<{
    memberProfileId?: string;
    status?: string;
    notes?: string | null;
  }>;
};

export async function POST(
  request: Request,
  context: { params: Promise<{ sessionId: string }> },
) {
  const tenantSlug = request.headers.get("x-tenant-slug");

  if (!tenantSlug) {
    return NextResponse.json({ error: "missing_tenant" }, { status: 400 });
  }

  const session = await getAdminSessionContext(tenantSlug, request.headers);

  if (!session) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const { sessionId } = await context.params;

  let body: RecordAttendanceBody;

  try {
    body = (await request.json()) as RecordAttendanceBody;
  } catch {
    return NextResponse.json({ error: "invalid_body" }, { status: 400 });
  }

  if (!Array.isArray(body.records)) {
    return NextResponse.json({ error: "invalid_body" }, { status: 400 });
  }

  const records = body.records.map((record) => ({
    memberProfileId: record.memberProfileId ?? "",
    status: record.status as "present" | "absent" | "excused" | "late",
    notes: record.notes ?? null,
  }));

  try {
    await recordBulkAttendance(session, tenantSlug, { sessionId, records });
    return NextResponse.json({ ok: true });
  } catch (error) {
    if (error instanceof RecordBulkAttendanceError) {
      switch (error.code) {
        case "tenant_not_found":
        case "session_not_found":
          return NextResponse.json({ error: error.code }, { status: 404 });
        case "forbidden":
          return NextResponse.json({ error: error.code }, { status: 403 });
        case "member_not_eligible":
        case "duplicate_member":
          return NextResponse.json({ error: error.code }, { status: 409 });
        case "missing_fields":
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
