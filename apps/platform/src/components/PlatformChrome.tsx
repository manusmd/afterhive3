"use client";

import { buildPlatformBreadcrumb } from "@/components/platform-breadcrumb";
import { PlatformAppShell, useT, type PlatformNavSection } from "@afterhive/ui";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

type PlatformChromeProps = {
  navSections: PlatformNavSection[];
  userName?: string;
  userRole?: string;
  userInitials?: string;
  children: ReactNode;
};

function isShellExcludedPath(pathname: string) {
  return pathname === "/" || pathname === "/login";
}

export function PlatformChrome({
  navSections,
  userName,
  userRole,
  userInitials,
  children,
}: PlatformChromeProps) {
  const pathname = usePathname();
  const t = useT();

  if (!userName || isShellExcludedPath(pathname)) {
    return children;
  }

  return (
    <PlatformAppShell
      breadcrumb={buildPlatformBreadcrumb(pathname, t)}
      searchPlaceholder={t("platform.shell.searchPlaceholder")}
      surfaceLabel={t("platform.shell.platformLabel")}
      userName={userName}
      userRole={userRole ?? ""}
      userInitials={userInitials ?? "?"}
      navSections={navSections}
      currentPath={pathname}
    >
      {children}
    </PlatformAppShell>
  );
}
