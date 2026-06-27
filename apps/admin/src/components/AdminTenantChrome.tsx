"use client";

import { buildAdminBreadcrumb } from "@/components/admin-breadcrumb";
import { AdminAppShell, useT, type AdminNavSection } from "@afterhive/ui";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

type AdminTenantChromeProps = {
  tenantSlug: string;
  tenantName: string;
  hrefPrefix: string;
  navSections: AdminNavSection[];
  userName?: string;
  userRole?: string;
  userInitials?: string;
  children: ReactNode;
};

function isShellExcludedPath(pathname: string, tenantSlug: string) {
  const base = `/${tenantSlug}`;

  return (
    pathname === `${base}/login` ||
    pathname.startsWith(`${base}/invite/`)
  );
}

export function AdminTenantChrome({
  tenantSlug,
  tenantName,
  hrefPrefix,
  navSections,
  userName,
  userRole,
  userInitials,
  children,
}: AdminTenantChromeProps) {
  const pathname = usePathname();
  const t = useT();

  if (!userName || isShellExcludedPath(pathname, tenantSlug)) {
    return children;
  }

  return (
    <AdminAppShell
      tenantName={tenantName}
      breadcrumb={buildAdminBreadcrumb(pathname, tenantSlug, t)}
      searchPlaceholder={t("admin.shell.searchPlaceholder")}
      surfaceLabel={t("admin.shell.tenantAdminLabel")}
      userName={userName}
      userRole={userRole ?? ""}
      userInitials={userInitials ?? "?"}
      navSections={navSections}
      currentPath={pathname}
      hrefPrefix={hrefPrefix}
    >
      {children}
    </AdminAppShell>
  );
}
