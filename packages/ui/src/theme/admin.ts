import type { ThemeOptions } from "@mui/material/styles";
import {
  afterhiveLayout,
  afterhiveShadows,
  afterhiveShape,
  afterhiveShell,
} from "./design-tokens";
import { createBaseTheme } from "./base";

export const compactSurfaceOptions: ThemeOptions = {
  shape: { borderRadius: afterhiveShape.borderRadius },
  typography: {
    body1: { fontSize: "0.875rem" },
  },
  components: {
    MuiAppBar: {
      styleOverrides: {
        root: ({ theme }) => ({
          backgroundColor: afterhiveShell.light.topbar,
          backgroundImage: "none",
          borderBottom: `1px solid ${theme.palette.divider}`,
          boxShadow: "none",
          minHeight: afterhiveLayout.topbarHeight,
          ...theme.applyStyles("dark", {
            backgroundColor: afterhiveShell.dark.topbar,
          }),
        }),
      },
    },
    MuiDrawer: {
      styleOverrides: {
        paper: ({ theme }) => ({
          width: afterhiveLayout.drawerWidth,
          backgroundColor: afterhiveShell.light.sidebar,
          borderRight: `1px solid ${afterhiveShell.light.sidebarBorder}`,
          ...theme.applyStyles("dark", {
            backgroundColor: afterhiveShell.dark.sidebar,
            borderRight: `1px solid ${afterhiveShell.dark.sidebarBorder}`,
          }),
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
            backgroundColor: afterhiveShell.light.navActiveBackground,
            color: afterhiveShell.light.navActiveText,
            "& .MuiListItemIcon-root": {
              color: "inherit",
            },
            "&:hover": {
              backgroundColor: afterhiveShell.light.navActiveBackground,
            },
          },
          ...theme.applyStyles("dark", {
            "&.Mui-selected": {
              backgroundColor: afterhiveShell.dark.navActiveBackground,
              color: afterhiveShell.dark.navActiveText,
              "&:hover": {
                backgroundColor: afterhiveShell.dark.navActiveBackground,
              },
            },
          }),
        }),
      },
    },
    MuiListItemIcon: {
      styleOverrides: {
        root: {
          color: "var(--mui-palette-text-secondary)",
        },
      },
    },
    MuiListSubheader: {
      styleOverrides: {
        root: ({ theme }) => ({
          backgroundColor: "transparent",
          color: afterhiveShell.light.navSectionLabel,
          fontSize: "0.6875rem",
          fontWeight: 600,
          letterSpacing: "0.08em",
          lineHeight: 1.6,
          textTransform: "uppercase",
          paddingTop: 16,
          paddingBottom: 8,
          ...theme.applyStyles("dark", {
            color: afterhiveShell.dark.navSectionLabel,
          }),
        }),
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: ({ theme }) => ({
          backgroundImage: "none",
          borderRadius: afterhiveShape.cardRadius,
          border: `1px solid ${afterhiveShell.light.cardBorder}`,
          boxShadow: afterhiveShadows.cardLight,
          ...theme.applyStyles("dark", {
            border: `1px solid ${afterhiveShell.dark.cardBorder}`,
            boxShadow: afterhiveShadows.cardDark,
          }),
        }),
      },
    },
    MuiOutlinedInput: {
      styleOverrides: {
        root: ({ theme }) => ({
          borderRadius: afterhiveShape.searchRadius,
          backgroundColor: afterhiveShell.light.searchBackground,
          "& .MuiOutlinedInput-notchedOutline": {
            borderColor: afterhiveShell.light.searchBorder,
          },
          "&:hover .MuiOutlinedInput-notchedOutline": {
            borderColor: theme.palette.divider,
          },
          ...theme.applyStyles("dark", {
            backgroundColor: afterhiveShell.dark.searchBackground,
            "& .MuiOutlinedInput-notchedOutline": {
              borderColor: afterhiveShell.dark.searchBorder,
            },
          }),
        }),
      },
    },
    MuiButton: {
      styleOverrides: {
        outlined: ({ theme }) => ({
          borderColor: afterhiveShell.light.secondaryButtonBorder,
          backgroundColor: afterhiveShell.light.secondaryButtonBackground,
          color: theme.palette.text.primary,
          "&:hover": {
            borderColor: theme.palette.divider,
            backgroundColor: afterhiveShell.light.secondaryButtonBackground,
          },
          ...theme.applyStyles("dark", {
            borderColor: afterhiveShell.dark.secondaryButtonBorder,
            backgroundColor: afterhiveShell.dark.secondaryButtonBackground,
            "&:hover": {
              backgroundColor: afterhiveShell.dark.secondaryButtonBackground,
            },
          }),
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
