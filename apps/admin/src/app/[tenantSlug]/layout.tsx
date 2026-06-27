import { getAdminAuth } from "@afterhive/api/auth/admin-auth";
import { getAdminSessionContext } from "@afterhive/api/auth/get-admin-session";
import { getTenantDisplayName } from "@afterhive/api/tenant/get-tenant-display-name";
import { createTranslator, DEFAULT_LOCALE, getMessages, translateStaffRole } from "@afterhive/shared/i18n";
import { headers } from "next/headers";
import { AdminTenantChrome } from "@/components/AdminTenantChrome";
import {
  buildAdminNav,
  resolveAdminClubNavVisible,
} from "@/components/build-admin-nav";

const t = createTranslator(getMessages(DEFAULT_LOCALE));
const hrefPrefix = process.env.BASE_PATH ?? "/app";

type TenantLayoutProps = {
  children: React.ReactNode;
  params: Promise<{ tenantSlug: string }>;
};

function deriveUserInitials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);

  if (parts.length >= 2) {
    return `${parts[0]![0] ?? ""}${parts[1]![0] ?? ""}`.toUpperCase();
  }

  return name.slice(0, 2).toUpperCase();
}

export default async function TenantLayout({ children, params }: TenantLayoutProps) {
  const { tenantSlug } = await params;
  const requestHeaders = await headers();
  const authSession = await getAdminAuth().api.getSession({ headers: requestHeaders });
  const session = await getAdminSessionContext(tenantSlug, requestHeaders);

  const tenantName = await getTenantDisplayName(tenantSlug);
  const userName = authSession?.user?.name ?? authSession?.user?.email ?? undefined;
  const userInitials = userName ? deriveUserInitials(userName) : undefined;
  const userRole = session?.roles[0] ? translateStaffRole(t, session.roles[0]) : undefined;
  const showClub = session ? await resolveAdminClubNavVisible(session) : false;
  const navSections =
    session && userName
      ? buildAdminNav({
          tenantSlug,
          session,
          showClub,
          t,
        })
      : [];

  return (
    <AdminTenantChrome
      tenantSlug={tenantSlug}
      tenantName={tenantName}
      hrefPrefix={hrefPrefix}
      navSections={navSections}
      userName={userName}
      userRole={userRole}
      userInitials={userInitials}
    >
      {children}
    </AdminTenantChrome>
  );
}
