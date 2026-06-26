import { getPlatformSessionContext } from "@afterhive/api/auth/get-platform-session";
import { createTranslator, DEFAULT_LOCALE, getMessages } from "@afterhive/shared/i18n";
import { SurfaceShell } from "@afterhive/ui";
import { Button, Stack, Typography } from "@mui/material";
import { headers } from "next/headers";
import Link from "next/link";
import { redirect } from "next/navigation";
import { PlatformLogoutButton } from "@/components/PlatformLogoutButton";

const t = createTranslator(getMessages(DEFAULT_LOCALE));

export default async function HomePage() {
  const session = await getPlatformSessionContext(await headers());

  if (session) {
    redirect("/tenants");
  }

  return (
    <SurfaceShell surface="platform" title={t("platform.home.title")}>
      <Stack spacing={2}>
        <Typography color="text.secondary">{t("platform.home.subtitle")}</Typography>
        <Link href="/login">
          <Button variant="contained">{t("platform.home.loginButton")}</Button>
        </Link>
      </Stack>
    </SurfaceShell>
  );
}
