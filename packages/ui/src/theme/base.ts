import { createTheme, type ThemeOptions } from "@mui/material/styles";

export const baseThemeOptions: ThemeOptions = {
  cssVariables: {
    colorSchemeSelector: "class",
  },
  colorSchemes: {
    light: {
      palette: {
        primary: {
          main: "#f97316",
          light: "#fb923c",
          dark: "#ea580c",
          contrastText: "#ffffff",
        },
        secondary: { main: "#64748b" },
        error: { main: "#dc2626" },
        success: { main: "#16a34a" },
        background: { default: "#fafafa", paper: "#ffffff" },
        divider: "rgba(0,0,0,0.08)",
      },
    },
    dark: {
      palette: {
        primary: {
          main: "#fb923c",
          light: "#fdba74",
          dark: "#f97316",
          contrastText: "#0a0a0b",
        },
        secondary: { main: "#94a3b8" },
        error: { main: "#ef4444" },
        success: { main: "#22c55e" },
        background: { default: "#0a0a0b", paper: "#141416" },
        divider: "rgba(255,255,255,0.08)",
      },
    },
  },
  typography: {
    fontFamily: '"Inter", system-ui, -apple-system, sans-serif',
    h1: { fontSize: "2rem", fontWeight: 600, lineHeight: 1.2 },
    h2: { fontSize: "1.5rem", fontWeight: 600, lineHeight: 1.3 },
    body1: { fontSize: "0.875rem", lineHeight: 1.5 },
    button: { textTransform: "none", fontWeight: 600 },
  },
  shape: { borderRadius: 8 },
  components: {
    MuiButton: {
      defaultProps: { disableElevation: true },
      styleOverrides: {
        root: { textTransform: "none", fontWeight: 600 },
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
