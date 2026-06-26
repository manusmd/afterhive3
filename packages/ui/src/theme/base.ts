import { createTheme, type ThemeOptions } from "@mui/material/styles";

export const baseThemeOptions: ThemeOptions = {
  cssVariables: true,
  colorSchemes: {
    light: {
      palette: {
        primary: { main: "#1a5cff" },
        background: { default: "#f5f7fb", paper: "#ffffff" },
      },
    },
    dark: {
      palette: {
        primary: { main: "#6b9bff" },
        background: { default: "#0f1419", paper: "#1a1f26" },
      },
    },
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
  },
  shape: { borderRadius: 10 },
};

export function createBaseTheme(options: ThemeOptions = {}) {
  return createTheme({ ...baseThemeOptions, ...options });
}
