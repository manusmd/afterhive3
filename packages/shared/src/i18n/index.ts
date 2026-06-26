import de from "./messages/de.json";
import { DEFAULT_LOCALE } from "./translate";

export type Messages = typeof de;

const catalogs: Record<string, Messages> = { de };

export function getMessages(locale: string = DEFAULT_LOCALE): Messages {
  return catalogs[locale] ?? catalogs.de;
}

export {
  translateLeadSource,
  translateLeadStatus,
  translateStaffRole,
  translateSubscriptionStatus,
  translateTenantPlan,
  translateTenantStatus,
} from "./labels";
export { createTranslator, DEFAULT_LOCALE, type TranslateValues } from "./translate";
export type { Messages as MessageCatalog };
