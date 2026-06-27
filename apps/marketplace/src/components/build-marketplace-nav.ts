import type { createTranslator } from "@afterhive/shared/i18n";
import type { MarketplaceNavSection } from "@afterhive/ui";

type BuildMarketplaceNavInput = {
  t: ReturnType<typeof createTranslator>;
};

export function buildMarketplaceNav({ t }: BuildMarketplaceNavInput): MarketplaceNavSection[] {
  return [
    {
      title: t("marketplace.shell.sections.browse"),
      items: [
        {
          label: t("marketplace.nav.discover"),
          href: "/",
        },
      ],
    },
  ];
}
