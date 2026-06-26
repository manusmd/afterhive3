"use client";

import { DEFAULT_LOCALE, getMessages } from "@afterhive/shared/i18n";
import { AdminThemeProvider, I18nProvider } from "@afterhive/ui";
import type { ReactNode } from "react";

type AdminI18nProviderProps = {
  children: ReactNode;
};

export function AdminI18nProvider({ children }: AdminI18nProviderProps) {
  return (
    <I18nProvider messages={getMessages(DEFAULT_LOCALE)}>
      <AdminThemeProvider>{children}</AdminThemeProvider>
    </I18nProvider>
  );
}
