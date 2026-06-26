import type { SessionContext } from "@afterhive/domain";
import { getPlatformAuth } from "./platform-auth";
import { resolvePlatformSession } from "./platform-session";

export type PlatformSessionRequestResult =
  | { kind: "unauthenticated" }
  | { kind: "no_membership" }
  | { kind: "active"; context: SessionContext };

export async function resolvePlatformSessionRequest(
  requestHeaders: Headers,
): Promise<PlatformSessionRequestResult> {
  const auth = getPlatformAuth();
  const session = await auth.api.getSession({
    headers: requestHeaders,
  });

  if (!session?.user) {
    return { kind: "unauthenticated" };
  }

  const context = await resolvePlatformSession(session.user.id);

  if (!context) {
    return { kind: "no_membership" };
  }

  return { kind: "active", context };
}

export async function getPlatformSessionContext(requestHeaders: Headers) {
  const result = await resolvePlatformSessionRequest(requestHeaders);
  return result.kind === "active" ? result.context : null;
}
