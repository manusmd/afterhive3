import { createTranslator, DEFAULT_LOCALE, getMessages } from "@afterhive/shared/i18n";
import { SurfaceShell } from "@afterhive/ui";
import { Typography } from "@mui/material";
import { LoginForm } from "./LoginForm";

const t = createTranslator(getMessages(DEFAULT_LOCALE));

type LoginPageProps = {
  params: Promise<{ tenantSlug: string }>;
};

export default async function LoginPage({ params }: LoginPageProps) {
  const { tenantSlug } = await params;

  return (
    <SurfaceShell surface="admin" title={t("admin.login.title")}>
      <Typography color="text.secondary" sx={{ mb: 1 }}>
        {t("admin.login.subtitle")}
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        {t("admin.login.demoHint")}
      </Typography>
      <LoginForm tenantSlug={tenantSlug} />
    </SurfaceShell>
  );
}
