import { NextResponse } from "next/server";
import { getAdminSessionContext } from "@afterhive/api/auth/get-admin-session";
import { canMergePersons } from "@afterhive/api/crm/can-merge-persons";
import { MergePersonsError, mergePersons } from "@afterhive/api/crm/merge-persons";

type MergeBody = {
  winnerId?: string;
  loserId?: string;
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

  if (!canMergePersons(session.roles)) {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }

  let body: MergeBody;

  try {
    body = (await request.json()) as MergeBody;
  } catch {
    return NextResponse.json({ error: "invalid_body" }, { status: 400 });
  }

  if (typeof body.winnerId !== "string" || typeof body.loserId !== "string") {
    return NextResponse.json({ error: "invalid_body" }, { status: 400 });
  }

  try {
    const result = await mergePersons(session, tenantSlug, {
      winnerId: body.winnerId,
      loserId: body.loserId,
    });
    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    if (error instanceof MergePersonsError) {
      const status = error.code === "tenant_not_found" ? 404 : 400;
      return NextResponse.json({ error: error.code }, { status });
    }

    throw error;
  }
}
