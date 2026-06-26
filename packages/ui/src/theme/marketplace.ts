import type { ThemeOptions } from "@mui/material/styles";
import { createBaseTheme } from "./base";

export const marketplaceTheme = createBaseTheme({
  shape: { borderRadius: 12 },
  typography: {
    h1: { fontWeight: 700, letterSpacing: "-0.02em" },
    h2: { fontWeight: 600 },
    body1: { fontSize: "1rem", lineHeight: 1.6 },
  },
  components: {
    MuiContainer: {
      defaultProps: { maxWidth: "lg" },
      styleOverrides: {
        root: { paddingTop: 32, paddingBottom: 32 },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: { borderRadius: 16 },
      },
    },
  },
} satisfies ThemeOptions);
