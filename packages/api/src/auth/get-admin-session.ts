import { getAdminAuth } from "./admin-auth";
import { resolveStaffSession } from "./staff-session";

export async function getAdminSessionContext(
  tenantSlug: string,
  requestHeaders: Headers,
) {
  const auth = getAdminAuth();
  const session = await auth.api.getSession({
    headers: requestHeaders,
  });

  if (!session?.user) {
    return null;
  }

  return resolveStaffSession(session.user.id, tenantSlug);
}
