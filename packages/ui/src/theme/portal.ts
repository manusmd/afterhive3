import type { ThemeOptions } from "@mui/material/styles";
import { createBaseTheme } from "./base";

export const portalTheme = createBaseTheme({
  shape: { borderRadius: 12 },
  typography: {
    body1: { fontSize: "1rem", lineHeight: 1.6 },
  },
  components: {
    MuiContainer: {
      defaultProps: { maxWidth: "md" },
      styleOverrides: {
        root: { paddingTop: 24, paddingBottom: 24 },
      },
    },
    MuiStack: {
      defaultProps: { useFlexGap: true },
    },
  },
} satisfies ThemeOptions);
