import { NextResponse } from "next/server";
import { getPortalSessionContext } from "@afterhive/api/auth/get-portal-session";
import {
  GetDocumentSignedUrlError,
  getDocumentSignedUrl,
} from "@afterhive/api/document/get-document-signed-url";

type RouteParams = {
  params: Promise<{ documentId: string }>;
};

export async function GET(request: Request, { params }: RouteParams) {
  const tenantSlug = request.headers.get("x-tenant-slug");

  if (!tenantSlug) {
    return NextResponse.json({ error: "missing_tenant" }, { status: 400 });
  }

  const session = await getPortalSessionContext(tenantSlug, request.headers);

  if (!session) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const { documentId } = await params;

  try {
    const result = await getDocumentSignedUrl(session, tenantSlug, documentId);
    return NextResponse.json(result);
  } catch (error) {
    if (error instanceof GetDocumentSignedUrlError) {
      const status =
        error.code === "tenant_not_found" || error.code === "document_not_found"
          ? 404
          : 403;
      return NextResponse.json({ error: error.code }, { status });
    }

    throw error;
  }
}
