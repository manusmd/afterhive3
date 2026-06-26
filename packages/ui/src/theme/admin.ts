import type { ThemeOptions } from "@mui/material/styles";
import { createBaseTheme } from "./base";

const compactSurfaceOptions: ThemeOptions = {
  shape: { borderRadius: 8 },
  typography: {
    body1: { fontSize: "0.875rem" },
  },
  components: {
    MuiTableCell: {
      styleOverrides: {
        root: { padding: "10px 16px" },
      },
    },
    MuiTableRow: {
      styleOverrides: {
        root: { height: 40 },
      },
    },
    MuiChip: {
      defaultProps: { size: "small" },
    },
  },
};

export const adminTheme = createBaseTheme(compactSurfaceOptions);
export const platformTheme = createBaseTheme(compactSurfaceOptions);
