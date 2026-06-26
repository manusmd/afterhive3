import { NextResponse } from "next/server";
import { getAdminSessionContext } from "@afterhive/api/auth/get-admin-session";
import { canAnonymizePerson } from "@afterhive/api/gdpr/can-anonymize-person";
import { AnonymizePersonError, anonymizePerson } from "@afterhive/api/gdpr/anonymize-person";

type AnonymizeRouteProps = {
  params: Promise<{ personId: string }>;
};

export async function POST(request: Request, { params }: AnonymizeRouteProps) {
  const tenantSlug = request.headers.get("x-tenant-slug");
  const { personId } = await params;

  if (!tenantSlug) {
    return NextResponse.json({ error: "missing_tenant" }, { status: 400 });
  }

  const session = await getAdminSessionContext(tenantSlug, request.headers);

  if (!session) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  if (!canAnonymizePerson(session.roles)) {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }

  try {
    const result = await anonymizePerson(session, tenantSlug, personId);
    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    if (error instanceof AnonymizePersonError) {
      const status =
        error.code === "person_not_found" || error.code === "tenant_not_found"
          ? 404
          : error.code === "already_anonymized"
            ? 409
            : 400;
      return NextResponse.json({ error: error.code }, { status });
    }

    throw error;
  }
}
