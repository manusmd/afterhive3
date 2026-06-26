import { listTenantLocations } from "@afterhive/api/auth/tenant-locations";
import { getAdminSessionContext } from "@afterhive/api/auth/get-admin-session";
import { canRunImport } from "@afterhive/api/crm/can-run-import";
import { createTranslator, DEFAULT_LOCALE, getMessages } from "@afterhive/shared/i18n";
import { SurfaceShell } from "@afterhive/ui";
import { Stack } from "@mui/material";
import Link from "next/link";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { SettingsForbidden } from "@/components/SettingsForbidden";
import { StaffLogoutButton } from "@/components/StaffLogoutButton";
import { ImportLeadsForm } from "./ImportLeadsForm";

const t = createTranslator(getMessages(DEFAULT_LOCALE));

type ImportPageProps = {
  params: Promise<{ tenantSlug: string }>;
};

export default async function ImportPage({ params }: ImportPageProps) {
  const { tenantSlug } = await params;
  const session = await getAdminSessionContext(tenantSlug, await headers());

  if (!session) {
    redirect(`/${tenantSlug}/login`);
  }

  const importTitle = t("admin.import.title");

  if (!canRunImport(session.roles, session.locationIds, session.roleAssignments)) {
    return (
      <SurfaceShell surface="admin" title={importTitle}>
        <Stack spacing={2}>
          <Stack direction="row" sx={{ justifyContent: "flex-end" }}>
            <StaffLogoutButton tenantSlug={tenantSlug} />
          </Stack>
          <SettingsForbidden tenantSlug={tenantSlug} title={importTitle} />
        </Stack>
      </SurfaceShell>
    );
  }

  const locations = await listTenantLocations(tenantSlug);

  return (
    <SurfaceShell surface="admin" title={importTitle}>
      <Stack spacing={4}>
        <Stack direction="row" spacing={1} sx={{ justifyContent: "space-between", flexWrap: "wrap" }}>
          <Stack direction="row" spacing={1}>
            <Link href={`/${tenantSlug}`}>{t("admin.nav.dashboard")}</Link>
            <Link href={`/${tenantSlug}/crm/leads`}>{t("admin.nav.leads")}</Link>
          </Stack>
          <StaffLogoutButton tenantSlug={tenantSlug} />
        </Stack>
        <ImportLeadsForm tenantSlug={tenantSlug} locations={locations} />
      </Stack>
    </SurfaceShell>
  );
}
