import { getPlatformAuth } from "./platform-auth";
import { resolvePlatformSession } from "./platform-session";

export async function getPlatformSessionContext(requestHeaders: Headers) {
  const auth = getPlatformAuth();
  const session = await auth.api.getSession({
    headers: requestHeaders,
  });

  if (!session?.user) {
    return null;
  }

  return resolvePlatformSession(session.user.id);
}
