import { createTranslator, DEFAULT_LOCALE, getMessages } from "@afterhive/shared/i18n";
import { SurfaceShell } from "@afterhive/ui";
import { Typography } from "@mui/material";

const t = createTranslator(getMessages(DEFAULT_LOCALE));

export default function HomePage() {
  return (
    <SurfaceShell surface="portal" title={t("portal.home.title")}>
      <Typography color="text.secondary">{t("portal.home.subtitle")}</Typography>
    </SurfaceShell>
  );
}
