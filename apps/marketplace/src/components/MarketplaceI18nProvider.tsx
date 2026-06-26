"use client";

import { DEFAULT_LOCALE, getMessages } from "@afterhive/shared/i18n";
import { I18nProvider, MarketplaceThemeProvider } from "@afterhive/ui";
import type { ReactNode } from "react";

type MarketplaceI18nProviderProps = {
  children: ReactNode;
};

export function MarketplaceI18nProvider({ children }: MarketplaceI18nProviderProps) {
  return (
    <I18nProvider messages={getMessages(DEFAULT_LOCALE)}>
      <MarketplaceThemeProvider>{children}</MarketplaceThemeProvider>
    </I18nProvider>
  );
}
