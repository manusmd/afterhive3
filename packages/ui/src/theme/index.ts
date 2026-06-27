export { createBaseTheme, baseThemeOptions } from "./base";
export {
  afterhiveLayout,
  afterhivePalette,
  afterhiveShape,
  afterhiveShell,
  afterhiveTypography,
} from "./design-tokens";
export { adminTheme, platformTheme } from "./admin";
export { portalTheme } from "./portal";
export { marketplaceTheme } from "./marketplace";

export type SurfaceTheme =
  | "platform"
  | "admin"
  | "portal"
  | "marketplace";

import { adminTheme, platformTheme } from "./admin";
import { portalTheme } from "./portal";
import { marketplaceTheme } from "./marketplace";
import type { Theme } from "@mui/material/styles";

const themes: Record<SurfaceTheme, Theme> = {
  platform: platformTheme,
  admin: adminTheme,
  portal: portalTheme,
  marketplace: marketplaceTheme,
};

export function getSurfaceTheme(surface: SurfaceTheme): Theme {
  return themes[surface];
}
