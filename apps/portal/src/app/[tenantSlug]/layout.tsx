import { getPortalAuth } from "@afterhive/api/auth/portal-auth";
import { getPortalSessionContext } from "@afterhive/api/auth/get-portal-session";
import { getTenantDisplayName } from "@afterhive/api/tenant/get-tenant-display-name";
import { createTranslator, DEFAULT_LOCALE, getMessages, translatePortalRole } from "@afterhive/shared/i18n";
import { headers } from "next/headers";
import { buildPortalNav } from "@/components/build-portal-nav";
import { PortalTenantChrome } from "@/components/PortalTenantChrome";

const t = createTranslator(getMessages(DEFAULT_LOCALE));
const hrefPrefix = process.env.BASE_PATH ?? "/portal";

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
  const authSession = await getPortalAuth().api.getSession({ headers: requestHeaders });
  const session = await getPortalSessionContext(tenantSlug, requestHeaders);

  const tenantName = await getTenantDisplayName(tenantSlug);
  const userName = authSession?.user?.name ?? authSession?.user?.email ?? undefined;
  const userInitials = userName ? deriveUserInitials(userName) : undefined;
  const userRole = session?.roles[0] ? translatePortalRole(t, session.roles[0]) : undefined;
  const navSections = session ? buildPortalNav({ tenantSlug, t }) : [];

  return (
    <PortalTenantChrome
      tenantSlug={tenantSlug}
      tenantName={tenantName}
      hrefPrefix={hrefPrefix}
      navSections={navSections}
      userName={userName}
      userRole={userRole}
      userInitials={userInitials}
    >
      {children}
    </PortalTenantChrome>
  );
}
