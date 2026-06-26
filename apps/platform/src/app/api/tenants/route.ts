import { NextResponse } from "next/server";
import { getPlatformSessionContext } from "@afterhive/api/auth/get-platform-session";
import { canCreateTenant } from "@afterhive/api/platform/can-create-tenant";
import { canListTenants } from "@afterhive/api/platform/can-list-tenants";
import { CreateTenantError, createTenant } from "@afterhive/api/platform/create-tenant";
import { listTenants, parseTenantStatus } from "@afterhive/api/platform/list-tenants";

type CreateTenantBody = {
  name?: string;
  slug?: string;
  legalName?: string;
  ownerEmail?: string;
  planId?: string;
};

export async function GET(request: Request) {
  const session = await getPlatformSessionContext(request.headers);

  if (!session || !canListTenants(session.roles)) {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }

  const url = new URL(request.url);
  const status = parseTenantStatus(url.searchParams.get("status") ?? undefined);
  const planId = url.searchParams.get("plan")?.trim() || undefined;
  const cursor = url.searchParams.get("cursor") ?? undefined;
  const limitParam = url.searchParams.get("limit");
  const limit = limitParam ? Number.parseInt(limitParam, 10) : undefined;

  const result = await listTenants({
    status,
    planId,
    cursor,
    limit: Number.isFinite(limit) ? limit : undefined,
  });

  return NextResponse.json(result);
}

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
