import de from "./messages/de.json";

export type Messages = typeof de;

const catalogs: Record<string, Messages> = { de };

export function getMessages(locale: string): Messages {
  return catalogs[locale] ?? catalogs.de;
}

export type { Messages as MessageCatalog };
