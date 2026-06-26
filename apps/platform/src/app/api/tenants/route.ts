import { NextResponse } from "next/server";
import { getPlatformSessionContext } from "@afterhive/api/auth/get-platform-session";
import { canCreateTenant } from "@afterhive/api/platform/can-create-tenant";
import { CreateTenantError, createTenant } from "@afterhive/api/platform/create-tenant";

type CreateTenantBody = {
  name?: string;
  slug?: string;
  legalName?: string;
  ownerEmail?: string;
  planId?: string;
};

export async function POST(request: Request) {
  const session = await getPlatformSessionContext(request.headers);

  if (!session || !canCreateTenant(session.roles)) {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }

  let body: CreateTenantBody;

  try {
    body = (await request.json()) as CreateTenantBody;
  } catch {
    return NextResponse.json({ error: "invalid_body" }, { status: 400 });
  }

  if (!body.name || !body.slug || !body.ownerEmail) {
    return NextResponse.json({ error: "missing_fields" }, { status: 400 });
  }

  try {
    const result = await createTenant({
      name: body.name,
      slug: body.slug,
      legalName: body.legalName,
      ownerEmail: body.ownerEmail,
      planId: body.planId,
      createdByUserId: session.userId,
    });

    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    if (error instanceof CreateTenantError) {
      const status = error.code === "invalid_slug" ? 400 : 409;
      return NextResponse.json({ error: error.code }, { status });
    }

    throw error;
  }
}
