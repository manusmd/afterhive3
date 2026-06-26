import { NextResponse } from "next/server";
import { getPlatformSessionContext } from "@afterhive/api/auth/get-platform-session";
import { canSuspendTenant } from "@afterhive/api/platform/can-suspend-tenant";
import { SuspendTenantError, suspendTenant } from "@afterhive/api/platform/suspend-tenant";

type SuspendTenantBody = {
  reason?: string;
};

type RouteContext = {
  params: Promise<{ tenantId: string }>;
};

export async function POST(request: Request, context: RouteContext) {
  const session = await getPlatformSessionContext(request.headers);

  if (!session || !canSuspendTenant(session.roles)) {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }

  const { tenantId } = await context.params;

  let body: SuspendTenantBody = {};

  try {
    const text = await request.text();
    if (text) {
      body = JSON.parse(text) as SuspendTenantBody;
    }
  } catch {
    return NextResponse.json({ error: "invalid_body" }, { status: 400 });
  }

  try {
    const result = await suspendTenant({
      tenantId,
      reason: body.reason,
      suspendedByUserId: session.userId,
    });

    return NextResponse.json(result);
  } catch (error) {
    if (error instanceof SuspendTenantError) {
      const status = error.code === "not_found" ? 404 : 409;
      return NextResponse.json({ error: error.code }, { status });
    }

    throw error;
  }
}
