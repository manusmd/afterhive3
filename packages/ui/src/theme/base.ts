import { createTheme, type ThemeOptions } from "@mui/material/styles";
import { afterhivePalette, afterhiveShape, afterhiveTypography } from "./design-tokens";

export const baseThemeOptions: ThemeOptions = {
  cssVariables: {
    colorSchemeSelector: "class",
  },
  colorSchemes: {
    light: {
      palette: afterhivePalette.light,
    },
    dark: {
      palette: afterhivePalette.dark,
    },
  },
  typography: afterhiveTypography,
  shape: { borderRadius: afterhiveShape.borderRadius },
  components: {
    MuiButton: {
      defaultProps: { disableElevation: true },
      styleOverrides: {
        root: {
          textTransform: "none",
          fontWeight: 600,
          borderRadius: afterhiveShape.buttonRadius,
        },
      },
    },
    MuiCssBaseline: {
      styleOverrides: {
        body: { WebkitFontSmoothing: "antialiased" },
      },
    },
  },
};

export function createBaseTheme(options: ThemeOptions = {}) {
  return createTheme({ ...baseThemeOptions, ...options });
}
