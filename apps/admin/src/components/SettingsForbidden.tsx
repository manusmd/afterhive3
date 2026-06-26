import { createTranslator, DEFAULT_LOCALE, getMessages } from "@afterhive/shared/i18n";
import { Stack, Typography } from "@mui/material";
import Link from "next/link";

const t = createTranslator(getMessages(DEFAULT_LOCALE));

type SettingsForbiddenProps = {
  tenantSlug: string;
  title: string;
};

export function SettingsForbidden({ tenantSlug, title }: SettingsForbiddenProps) {
  return (
    <Stack spacing={2}>
      <Typography variant="h6">{title}</Typography>
      <Typography color="text.secondary">{t("admin.settings.forbidden.message")}</Typography>
      <Link href={`/${tenantSlug}`}>{t("admin.settings.forbidden.backToDashboard")}</Link>
    </Stack>
  );
}
