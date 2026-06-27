import { getPlatformSessionContext } from "@afterhive/api/auth/get-platform-session";
import { canCreateTenant } from "@afterhive/api/platform/can-create-tenant";
import { createTranslator, DEFAULT_LOCALE, getMessages } from "@afterhive/shared/i18n";
import { Panel } from "@afterhive/ui";
import { Stack, Typography } from "@mui/material";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { PlatformPageFrame } from "@/components/PlatformPageFrame";
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
    <PlatformPageFrame title={t("platform.tenants.create.title")}>
      <Stack spacing={2}>
        <Panel>
          <Typography color="text.secondary" sx={{ mb: 3 }}>
            {t("platform.tenants.create.description")}
          </Typography>
          <CreateTenantForm />
        </Panel>
      </Stack>
    </PlatformPageFrame>
  );
}
