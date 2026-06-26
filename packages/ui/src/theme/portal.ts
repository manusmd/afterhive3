import type { ThemeOptions } from "@mui/material/styles";
import { createBaseTheme } from "./base";

export const portalTheme = createBaseTheme({
  spacing: 9,
  components: {
    MuiContainer: {
      styleOverrides: {
        root: { paddingTop: 24, paddingBottom: 24 },
      },
    },
  },
} satisfies ThemeOptions);
