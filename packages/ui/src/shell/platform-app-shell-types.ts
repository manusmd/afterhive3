export type PlatformNavItem = {
  label: string;
  href: string;
  badge?: number;
};

export type PlatformNavSection = {
  title: string;
  items: PlatformNavItem[];
};

export type PlatformAppShellProps = {
  breadcrumb: string;
  searchPlaceholder: string;
  surfaceLabel: string;
  userName: string;
  userRole: string;
  userInitials: string;
  navSections: PlatformNavSection[];
  currentPath: string;
  children: React.ReactNode;
};
