import type { ThemeOptions } from "@mui/material/styles";
import { createBaseTheme } from "./base";

export const marketplaceTheme = createBaseTheme({
  typography: {
    h1: { fontWeight: 700, letterSpacing: "-0.02em" },
    h2: { fontWeight: 600 },
  },
  components: {
    MuiCard: {
      styleOverrides: {
        root: { borderRadius: 16 },
      },
    },
  },
} satisfies ThemeOptions);
