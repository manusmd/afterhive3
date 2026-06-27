import { createTranslator, DEFAULT_LOCALE, getMessages } from "@afterhive/shared/i18n";
import { Panel } from "@afterhive/ui";
import { Typography } from "@mui/material";
import { MarketplacePageFrame } from "@/components/MarketplacePageFrame";

const t = createTranslator(getMessages(DEFAULT_LOCALE));

export default function HomePage() {
  return (
    <MarketplacePageFrame title={t("marketplace.home.title")}>
      <Panel>
        <Typography color="text.secondary">{t("marketplace.home.subtitle")}</Typography>
      </Panel>
    </MarketplacePageFrame>
  );
}
