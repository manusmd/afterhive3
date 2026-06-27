"use client";

import { buildMarketplaceBreadcrumb } from "@/components/marketplace-breadcrumb";
import { MarketplaceAppShell, useT, type MarketplaceNavSection } from "@afterhive/ui";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

type MarketplaceChromeProps = {
  hrefPrefix: string;
  navSections: MarketplaceNavSection[];
  children: ReactNode;
};

export function MarketplaceChrome({ hrefPrefix, navSections, children }: MarketplaceChromeProps) {
  const pathname = usePathname();
  const t = useT();

  return (
    <MarketplaceAppShell
      breadcrumb={buildMarketplaceBreadcrumb(pathname, t)}
      searchPlaceholder={t("marketplace.shell.searchPlaceholder")}
      surfaceLabel={t("marketplace.shell.marketplaceLabel")}
      navSections={navSections}
      currentPath={pathname}
      hrefPrefix={hrefPrefix}
    >
      {children}
    </MarketplaceAppShell>
  );
}
