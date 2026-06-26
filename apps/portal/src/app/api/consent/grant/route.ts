import { NextResponse } from "next/server";
import { getPortalSessionContext } from "@afterhive/api/auth/get-portal-session";
import { GrantConsentError, grantConsent, type ConsentType } from "@afterhive/api/portal/grant-consent";

type GrantBody = {
  minorPersonId?: string;
  type?: ConsentType;
};

export async function POST(request: Request) {
  const tenantSlug = request.headers.get("x-tenant-slug");

  if (!tenantSlug) {
    return NextResponse.json({ error: "missing_tenant" }, { status: 400 });
  }

  const session = await getPortalSessionContext(tenantSlug, request.headers);

  if (!session) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  let body: GrantBody;

  try {
    body = (await request.json()) as GrantBody;
  } catch {
    return NextResponse.json({ error: "invalid_body" }, { status: 400 });
  }

  if (typeof body.minorPersonId !== "string" || body.type !== "enrollment") {
    return NextResponse.json({ error: "invalid_body" }, { status: 400 });
  }

  try {
    const result = await grantConsent(session, tenantSlug, {
      minorPersonId: body.minorPersonId,
      type: body.type,
    });
    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    if (error instanceof GrantConsentError) {
      const status =
        error.code === "tenant_not_found" || error.code === "person_not_found"
          ? 404
          : error.code === "not_guardian"
            ? 403
            : 400;
      return NextResponse.json({ error: error.code }, { status });
    }

    throw error;
  }
}
