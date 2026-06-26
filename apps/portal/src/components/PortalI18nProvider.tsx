"use client";

import { DEFAULT_LOCALE, getMessages } from "@afterhive/shared/i18n";
import { I18nProvider, PortalThemeProvider } from "@afterhive/ui";
import type { ReactNode } from "react";

type PortalI18nProviderProps = {
  children: ReactNode;
};

export function PortalI18nProvider({ children }: PortalI18nProviderProps) {
  return (
    <I18nProvider messages={getMessages(DEFAULT_LOCALE)}>
      <PortalThemeProvider>{children}</PortalThemeProvider>
    </I18nProvider>
  );
}
