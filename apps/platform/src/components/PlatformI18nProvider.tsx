"use client";

import { DEFAULT_LOCALE, getMessages } from "@afterhive/shared/i18n";
import { I18nProvider, PlatformThemeProvider } from "@afterhive/ui";
import type { ReactNode } from "react";

type PlatformI18nProviderProps = {
  children: ReactNode;
};

export function PlatformI18nProvider({ children }: PlatformI18nProviderProps) {
  return (
    <I18nProvider messages={getMessages(DEFAULT_LOCALE)}>
      <PlatformThemeProvider>{children}</PlatformThemeProvider>
    </I18nProvider>
  );
}
