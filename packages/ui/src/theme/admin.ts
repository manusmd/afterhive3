import type { ThemeOptions } from "@mui/material/styles";
import { createBaseTheme } from "./base";

const adminOptions: ThemeOptions = {
  components: {
    MuiTableCell: {
      styleOverrides: {
        root: { padding: "10px 16px" },
      },
    },
  },
};

export const adminTheme = createBaseTheme(adminOptions);
export const platformTheme = createBaseTheme(adminOptions);
