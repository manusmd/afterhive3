import { Panel } from "@afterhive/ui";
import { createTranslator, DEFAULT_LOCALE, getMessages } from "@afterhive/shared/i18n";
import { Stack, Typography } from "@mui/material";
import Link from "next/link";

const t = createTranslator(getMessages(DEFAULT_LOCALE));

type SettingsForbiddenProps = {
  tenantSlug: string;
};

export function SettingsForbidden({ tenantSlug }: SettingsForbiddenProps) {
  return (
    <Panel>
      <Stack spacing={2}>
        <Typography color="text.secondary">{t("admin.settings.forbidden.message")}</Typography>
        <Link href={`/${tenantSlug}`}>{t("admin.settings.forbidden.backToDashboard")}</Link>
      </Stack>
    </Panel>
  );
}
