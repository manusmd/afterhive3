export type PortalNavItem = {
  label: string;
  href: string;
  badge?: number;
};

export type PortalNavSection = {
  title: string;
  items: PortalNavItem[];
};

export type PortalAppShellProps = {
  tenantName: string;
  breadcrumb: string;
  searchPlaceholder: string;
  surfaceLabel: string;
  userName: string;
  userRole: string;
  userInitials: string;
  navSections: PortalNavSection[];
  currentPath: string;
  hrefPrefix?: string;
  children: React.ReactNode;
};
