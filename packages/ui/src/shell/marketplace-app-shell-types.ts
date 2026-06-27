export type MarketplaceNavItem = {
  label: string;
  href: string;
  badge?: number;
};

export type MarketplaceNavSection = {
  title: string;
  items: MarketplaceNavItem[];
};

export type MarketplaceAppShellProps = {
  breadcrumb: string;
  searchPlaceholder: string;
  surfaceLabel: string;
  navSections: MarketplaceNavSection[];
  currentPath: string;
  hrefPrefix?: string;
  children: React.ReactNode;
};
