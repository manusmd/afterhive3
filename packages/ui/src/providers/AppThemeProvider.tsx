"use client";

import { AppRouterCacheProvider } from "@mui/material-nextjs/v15-appRouter";
import { CssBaseline, ThemeProvider } from "@mui/material";
import type { Theme } from "@mui/material/styles";
import type { ReactNode } from "react";

type AppThemeProviderProps = {
  theme: Theme;
  defaultMode?: "light" | "dark" | "system";
  children: ReactNode;
};

export function AppThemeProvider({
  theme,
  defaultMode = "system",
  children,
}: AppThemeProviderProps) {
  return (
    <AppRouterCacheProvider options={{ key: "mui" }}>
      <ThemeProvider theme={theme} defaultMode={defaultMode}>
        <CssBaseline enableColorScheme />
        {children}
      </ThemeProvider>
    </AppRouterCacheProvider>
  );
}
