import { createTranslator, DEFAULT_LOCALE, getMessages } from "@afterhive/shared/i18n";
import { SurfaceShell } from "@afterhive/ui";
import { Typography } from "@mui/material";
import { PlatformLoginForm } from "./PlatformLoginForm";

const t = createTranslator(getMessages(DEFAULT_LOCALE));

export default function PlatformLoginPage() {
  return (
    <SurfaceShell surface="platform" title={t("platform.login.title")}>
      <Typography color="text.secondary" sx={{ mb: 3 }}>
        {t("platform.login.subtitle")}
      </Typography>
      <PlatformLoginForm />
    </SurfaceShell>
  );
}
