import { getPlatformSessionContext } from "@afterhive/api/auth/get-platform-session";
import { canCreateTenant } from "@afterhive/api/platform/can-create-tenant";
import { createTranslator, DEFAULT_LOCALE, getMessages } from "@afterhive/shared/i18n";
import { SurfaceShell } from "@afterhive/ui";
import { Button, Stack } from "@mui/material";
import Link from "next/link";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { PlatformToolbar } from "@/components/PlatformToolbar";
import { CreateTenantForm } from "./CreateTenantForm";

const t = createTranslator(getMessages(DEFAULT_LOCALE));

export default async function CreateTenantPage() {
  const session = await getPlatformSessionContext(await headers());

  if (!session) {
    redirect("/login");
  }

  if (!canCreateTenant(session.roles)) {
    redirect("/");
  }

  return (
    <SurfaceShell surface="platform" title={t("platform.tenants.create.title")}>
      <Stack spacing={3}>
        <PlatformToolbar />
        <Link href="/tenants">
          <Button sx={{ alignSelf: "flex-start" }}>{t("platform.tenants.create.backToList")}</Button>
        </Link>
        <CreateTenantForm />
      </Stack>
    </SurfaceShell>
  );
}
