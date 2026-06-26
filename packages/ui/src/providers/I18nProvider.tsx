"use client";

import { createTranslator, type MessageCatalog, type TranslateValues } from "@afterhive/shared/i18n";
import { createContext, useContext, useMemo, type ReactNode } from "react";

type TranslateFn = (key: string, values?: TranslateValues) => string;

const I18nContext = createContext<TranslateFn | null>(null);

type I18nProviderProps = {
  messages: MessageCatalog;
  children: ReactNode;
};

export function I18nProvider({ messages, children }: I18nProviderProps) {
  const translate = useMemo(() => createTranslator(messages), [messages]);

  return <I18nContext.Provider value={translate}>{children}</I18nContext.Provider>;
}

export function useT() {
  const translate = useContext(I18nContext);
  if (!translate) {
    throw new Error("useT must be used within I18nProvider");
  }
  return translate;
}
