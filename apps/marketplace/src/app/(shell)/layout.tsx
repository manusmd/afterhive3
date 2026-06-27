import { createTranslator, DEFAULT_LOCALE, getMessages } from "@afterhive/shared/i18n";
import { buildMarketplaceNav } from "@/components/build-marketplace-nav";
import { MarketplaceChrome } from "@/components/MarketplaceChrome";

const t = createTranslator(getMessages(DEFAULT_LOCALE));
const hrefPrefix = process.env.BASE_PATH ?? "/discover";

type ShellLayoutProps = {
  children: React.ReactNode;
};

export default function ShellLayout({ children }: ShellLayoutProps) {
  const navSections = buildMarketplaceNav({ t });

  return (
    <MarketplaceChrome hrefPrefix={hrefPrefix} navSections={navSections}>
      {children}
    </MarketplaceChrome>
  );
}
