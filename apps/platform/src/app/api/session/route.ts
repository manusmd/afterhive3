import { NextResponse } from "next/server";
import { resolvePlatformSessionRequest } from "@afterhive/api/auth/get-platform-session";

export async function GET(request: Request) {
  const result = await resolvePlatformSessionRequest(request.headers);

  switch (result.kind) {
    case "unauthenticated":
      return NextResponse.json({ error: "unauthenticated" }, { status: 401 });
    case "no_membership":
      return NextResponse.json({ error: "no_platform_membership" }, { status: 403 });
    case "active":
      return NextResponse.json(result.context);
    default: {
      const _exhaustive: never = result;
      return _exhaustive;
    }
  }
}
