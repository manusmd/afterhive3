import { NextResponse } from "next/server";
import { getAdminSessionContext } from "@afterhive/api/auth/get-admin-session";
import { canRunImport } from "@afterhive/api/crm/can-run-import";
import {
  ImportLeadsCsvError,
  importLeadsCsv,
  type LeadImportMapping,
} from "@afterhive/api/crm/import-leads-csv";

type ImportBody = {
  csvContent?: string;
  mapping?: LeadImportMapping;
  defaultLocationId?: string;
  fileName?: string;
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

  if (!canRunImport(session.roles, session.locationIds, session.roleAssignments)) {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }

  let body: ImportBody;

  try {
    body = (await request.json()) as ImportBody;
  } catch {
    return NextResponse.json({ error: "invalid_body" }, { status: 400 });
  }

  if (
    typeof body.csvContent !== "string" ||
    !body.mapping ||
    typeof body.mapping.firstName !== "string" ||
    typeof body.mapping.lastName !== "string"
  ) {
    return NextResponse.json({ error: "invalid_body" }, { status: 400 });
  }

  try {
    const result = await importLeadsCsv(session, tenantSlug, {
      csvContent: body.csvContent,
      mapping: body.mapping,
      defaultLocationId: body.defaultLocationId,
      fileName: body.fileName,
    });
    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    if (error instanceof ImportLeadsCsvError) {
      const status = error.code === "tenant_not_found" ? 404 : 400;
      return NextResponse.json({ error: error.code }, { status });
    }

    throw error;
  }
}
