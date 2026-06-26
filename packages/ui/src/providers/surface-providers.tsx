"use client";

import type { ReactNode } from "react";
import { adminTheme, marketplaceTheme, platformTheme, portalTheme } from "../theme";
import { AppThemeProvider } from "./AppThemeProvider";

type SurfaceProviderProps = {
  children: ReactNode;
};

export function AdminThemeProvider({ children }: SurfaceProviderProps) {
  return (
    <AppThemeProvider theme={adminTheme} defaultMode="dark">
      {children}
    </AppThemeProvider>
  );
}

export function PlatformThemeProvider({ children }: SurfaceProviderProps) {
  return (
    <AppThemeProvider theme={platformTheme} defaultMode="dark">
      {children}
    </AppThemeProvider>
  );
}

export function PortalThemeProvider({ children }: SurfaceProviderProps) {
  return (
    <AppThemeProvider theme={portalTheme} defaultMode="light">
      {children}
    </AppThemeProvider>
  );
}

export function MarketplaceThemeProvider({ children }: SurfaceProviderProps) {
  return (
    <AppThemeProvider theme={marketplaceTheme} defaultMode="light">
      {children}
    </AppThemeProvider>
  );
}
