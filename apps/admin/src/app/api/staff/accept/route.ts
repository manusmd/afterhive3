import { NextResponse } from "next/server";
import {
  AcceptStaffInviteError,
  acceptStaffInvite,
} from "@afterhive/api/auth/accept-staff-invite";

type AcceptStaffInviteBody = {
  token?: string;
  name?: string;
  password?: string;
};

export async function POST(request: Request) {
  const tenantSlug = request.headers.get("x-tenant-slug");

  if (!tenantSlug) {
    return NextResponse.json({ error: "missing_tenant" }, { status: 400 });
  }

  let body: AcceptStaffInviteBody;

  try {
    body = (await request.json()) as AcceptStaffInviteBody;
  } catch {
    return NextResponse.json({ error: "invalid_body" }, { status: 400 });
  }

  if (!body.token || !body.name || !body.password) {
    return NextResponse.json({ error: "missing_fields" }, { status: 400 });
  }

  try {
    const result = await acceptStaffInvite({
      tenantSlug,
      token: body.token,
      name: body.name,
      password: body.password,
    });

    return NextResponse.json(result);
  } catch (error) {
    if (error instanceof AcceptStaffInviteError) {
      const status = error.code === "invalid_invite" ? 404 : 409;
      return NextResponse.json({ error: error.code }, { status });
    }

    throw error;
  }
}
