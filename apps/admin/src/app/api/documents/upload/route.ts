import { NextResponse } from "next/server";
import { getAdminSessionContext } from "@afterhive/api/auth/get-admin-session";
import { canUploadDocument } from "@afterhive/api/document/can-upload-document";
import { UploadDocumentError, uploadDocument } from "@afterhive/api/document/upload-document";

export async function POST(request: Request) {
  const tenantSlug = request.headers.get("x-tenant-slug");

  if (!tenantSlug) {
    return NextResponse.json({ error: "missing_tenant" }, { status: 400 });
  }

  const session = await getAdminSessionContext(tenantSlug, request.headers);

  if (!session) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  if (!canUploadDocument(session.roles)) {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }

  let formData: FormData;

  try {
    formData = await request.formData();
  } catch {
    return NextResponse.json({ error: "invalid_body" }, { status: 400 });
  }

  const file = formData.get("file");

  if (!(file instanceof File)) {
    return NextResponse.json({ error: "invalid_body" }, { status: 400 });
  }

  try {
    const body = Buffer.from(await file.arrayBuffer());
    const result = await uploadDocument(session, tenantSlug, {
      filename: file.name,
      mimeType: file.type || "application/octet-stream",
      body,
    });
    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    if (error instanceof UploadDocumentError) {
      const status =
        error.code === "tenant_not_found"
          ? 404
          : error.code === "invalid_file" ||
              error.code === "file_too_large" ||
              error.code === "mime_not_allowed"
            ? 400
            : 502;
      return NextResponse.json({ error: error.code }, { status });
    }

    throw error;
  }
}
