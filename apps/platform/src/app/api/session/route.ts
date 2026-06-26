import { NextResponse } from "next/server";
import { getPlatformSessionContext } from "@afterhive/api/auth/get-platform-session";

export async function GET(request: Request) {
  const context = await getPlatformSessionContext(request.headers);

  if (!context) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  return NextResponse.json(context);
}
