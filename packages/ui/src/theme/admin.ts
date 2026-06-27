import type { ThemeOptions } from "@mui/material/styles";
import {
  afterhiveLayout,
  afterhiveShadows,
  afterhiveShape,
  afterhiveShell,
} from "./design-tokens";
import { createBaseTheme } from "./base";

const compactSurfaceOptions: ThemeOptions = {
  shape: { borderRadius: afterhiveShape.borderRadius },
  typography: {
    body1: { fontSize: "0.875rem" },
  },
  components: {
    MuiAppBar: {
      styleOverrides: {
        root: ({ theme }) => ({
          backgroundColor:
            theme.palette.mode === "dark"
              ? afterhiveShell.dark.topbar
              : afterhiveShell.light.topbar,
          backgroundImage: "none",
          borderBottom: `1px solid ${theme.palette.divider}`,
          boxShadow: "none",
          minHeight: afterhiveLayout.topbarHeight,
        }),
      },
    },
    MuiDrawer: {
      styleOverrides: {
        paper: ({ theme }) => ({
          width: afterhiveLayout.drawerWidth,
          backgroundColor:
            theme.palette.mode === "dark"
              ? afterhiveShell.dark.sidebar
              : afterhiveShell.light.sidebar,
          borderRight: `1px solid ${
            theme.palette.mode === "dark"
              ? afterhiveShell.dark.sidebarBorder
              : afterhiveShell.light.sidebarBorder
          }`,
        }),
      },
    },
    MuiListItemButton: {
      styleOverrides: {
        root: ({ theme }) => ({
          minHeight: afterhiveLayout.navItemHeight,
          borderRadius: afterhiveShape.borderRadius,
          marginInline: 8,
          marginBlock: 2,
          "&.Mui-selected": {
            backgroundColor:
              theme.palette.mode === "dark"
                ? afterhiveShell.dark.navActiveBackground
                : afterhiveShell.light.navActiveBackground,
            color:
              theme.palette.mode === "dark"
                ? afterhiveShell.dark.navActiveText
                : afterhiveShell.light.navActiveText,
            "& .MuiListItemIcon-root": {
              color: "inherit",
            },
            "&:hover": {
              backgroundColor:
                theme.palette.mode === "dark"
                  ? afterhiveShell.dark.navActiveBackground
                  : afterhiveShell.light.navActiveBackground,
            },
          },
        }),
      },
    },
    MuiListSubheader: {
      styleOverrides: {
        root: ({ theme }) => ({
          backgroundColor: "transparent",
          color:
            theme.palette.mode === "dark"
              ? afterhiveShell.dark.navSectionLabel
              : afterhiveShell.light.navSectionLabel,
          fontSize: "0.6875rem",
          fontWeight: 600,
          letterSpacing: "0.08em",
          lineHeight: 1.6,
          textTransform: "uppercase",
          paddingTop: 16,
          paddingBottom: 8,
        }),
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: ({ theme }) => ({
          backgroundImage: "none",
          borderRadius: afterhiveShape.cardRadius,
          border: `1px solid ${
            theme.palette.mode === "dark"
              ? afterhiveShell.dark.cardBorder
              : afterhiveShell.light.cardBorder
          }`,
          boxShadow:
            theme.palette.mode === "dark" ? afterhiveShadows.cardDark : afterhiveShadows.cardLight,
        }),
      },
    },
    MuiOutlinedInput: {
      styleOverrides: {
        root: ({ theme }) => ({
          borderRadius: afterhiveShape.searchRadius,
          backgroundColor:
            theme.palette.mode === "dark"
              ? afterhiveShell.dark.searchBackground
              : afterhiveShell.light.searchBackground,
          "& .MuiOutlinedInput-notchedOutline": {
            borderColor:
              theme.palette.mode === "dark"
                ? afterhiveShell.dark.searchBorder
                : afterhiveShell.light.searchBorder,
          },
          "&:hover .MuiOutlinedInput-notchedOutline": {
            borderColor: theme.palette.divider,
          },
        }),
      },
    },
    MuiButton: {
      styleOverrides: {
        outlined: ({ theme }) => ({
          borderColor:
            theme.palette.mode === "dark"
              ? afterhiveShell.dark.secondaryButtonBorder
              : afterhiveShell.light.secondaryButtonBorder,
          backgroundColor:
            theme.palette.mode === "dark"
              ? afterhiveShell.dark.secondaryButtonBackground
              : afterhiveShell.light.secondaryButtonBackground,
          color: theme.palette.text.primary,
          "&:hover": {
            borderColor: theme.palette.divider,
            backgroundColor:
              theme.palette.mode === "dark"
                ? afterhiveShell.dark.secondaryButtonBackground
                : afterhiveShell.light.secondaryButtonBackground,
          },
        }),
      },
    },
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
      styleOverrides: {
        root: { borderRadius: afterhiveShape.chipRadius, fontWeight: 600 },
      },
    },
  },
};

export const adminTheme = createBaseTheme(compactSurfaceOptions);
export const platformTheme = createBaseTheme(compactSurfaceOptions);
