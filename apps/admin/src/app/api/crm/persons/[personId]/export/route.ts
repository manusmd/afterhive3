import { NextResponse } from "next/server";
import { getAdminSessionContext } from "@afterhive/api/auth/get-admin-session";
import { canExportPerson } from "@afterhive/api/gdpr/can-export-person";
import { ExportPersonError, exportPerson } from "@afterhive/api/gdpr/export-person";

type ExportRouteProps = {
  params: Promise<{ personId: string }>;
};

export async function POST(request: Request, { params }: ExportRouteProps) {
  const tenantSlug = request.headers.get("x-tenant-slug");
  const { personId } = await params;

  if (!tenantSlug) {
    return NextResponse.json({ error: "missing_tenant" }, { status: 400 });
  }

  const session = await getAdminSessionContext(tenantSlug, request.headers);

  if (!session) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  if (!canExportPerson(session.roles, session.locationIds)) {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }

  try {
    const result = await exportPerson(session, tenantSlug, personId);
    return new NextResponse(Buffer.from(result.zip), {
      status: 200,
      headers: {
        "Content-Type": "application/zip",
        "Content-Disposition": `attachment; filename="${result.fileName}"`,
      },
    });
  } catch (error) {
    if (error instanceof ExportPersonError) {
      const status =
        error.code === "location_forbidden"
          ? 403
          : error.code === "person_not_found" || error.code === "tenant_not_found"
            ? 404
            : 400;
      return NextResponse.json({ error: error.code }, { status });
    }

    throw error;
  }
}
