"use client";

import { buildPortalBreadcrumb } from "@/components/portal-breadcrumb";
import { PortalAppShell, useT, type PortalNavSection } from "@afterhive/ui";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

type PortalTenantChromeProps = {
  tenantSlug: string;
  tenantName: string;
  hrefPrefix: string;
  navSections: PortalNavSection[];
  userName?: string;
  userRole?: string;
  userInitials?: string;
  children: ReactNode;
};

function isShellExcludedPath(pathname: string, tenantSlug: string) {
  return pathname === `/${tenantSlug}/login`;
}

export function PortalTenantChrome({
  tenantSlug,
  tenantName,
  hrefPrefix,
  navSections,
  userName,
  userRole,
  userInitials,
  children,
}: PortalTenantChromeProps) {
  const pathname = usePathname();
  const t = useT();

  if (!userName || isShellExcludedPath(pathname, tenantSlug)) {
    return children;
  }

  return (
    <PortalAppShell
      tenantName={tenantName}
      breadcrumb={buildPortalBreadcrumb(pathname, tenantSlug, t)}
      searchPlaceholder={t("portal.shell.searchPlaceholder")}
      surfaceLabel={t("portal.shell.portalLabel")}
      userName={userName}
      userRole={userRole ?? ""}
      userInitials={userInitials ?? "?"}
      navSections={navSections}
      currentPath={pathname}
      hrefPrefix={hrefPrefix}
    >
      {children}
    </PortalAppShell>
  );
}
