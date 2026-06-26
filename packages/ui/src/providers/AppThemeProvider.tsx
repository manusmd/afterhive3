"use client";

import { CssBaseline, ThemeProvider } from "@mui/material";
import type { Theme } from "@mui/material/styles";
import type { ReactNode } from "react";

type AppThemeProviderProps = {
  theme: Theme;
  children: ReactNode;
};

export function AppThemeProvider({ theme, children }: AppThemeProviderProps) {
  return (
    <ThemeProvider theme={theme} defaultMode="system">
      <CssBaseline />
      {children}
    </ThemeProvider>
  );
}
