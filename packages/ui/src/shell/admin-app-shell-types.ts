export type AdminNavItem = {
  label: string;
  href: string;
  badge?: number;
};

export type AdminNavSection = {
  title: string;
  items: AdminNavItem[];
};

export type AdminAppShellProps = {
  tenantName: string;
  breadcrumb: string;
  searchPlaceholder: string;
  surfaceLabel: string;
  userName: string;
  userRole: string;
  userInitials: string;
  navSections: AdminNavSection[];
  currentPath: string;
  hrefPrefix?: string;
  children: React.ReactNode;
};
