export { getSurfaceTheme, type SurfaceTheme } from "./theme";
export { AppThemeProvider } from "./providers/AppThemeProvider";
export {
  AdminThemeProvider,
  MarketplaceThemeProvider,
  PlatformThemeProvider,
  PortalThemeProvider,
} from "./providers/surface-providers";
export { SurfaceShell } from "./shell/SurfaceShell";
export { AdminAppShell } from "./shell/AdminAppShell";
export type {
  AdminAppShellProps,
  AdminNavItem,
  AdminNavSection,
} from "./shell/admin-app-shell-types";
export { I18nProvider, useT } from "./providers/I18nProvider";
