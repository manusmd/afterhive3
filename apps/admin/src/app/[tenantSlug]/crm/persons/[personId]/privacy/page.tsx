import { getAdminSessionContext } from "@afterhive/api/auth/get-admin-session";
import { listPersons } from "@afterhive/api/crm/list-persons";
import { canExportPerson } from "@afterhive/api/gdpr/can-export-person";
import { createTranslator, DEFAULT_LOCALE, getMessages } from "@afterhive/shared/i18n";
import { SurfaceShell } from "@afterhive/ui";
import { Stack, Typography } from "@mui/material";
import Link from "next/link";
import { headers } from "next/headers";
import { notFound, redirect } from "next/navigation";
import { SettingsForbidden } from "@/components/SettingsForbidden";
import { StaffLogoutButton } from "@/components/StaffLogoutButton";
import { ExportPersonButton } from "./ExportPersonButton";

const t = createTranslator(getMessages(DEFAULT_LOCALE));

type PersonPrivacyPageProps = {
  params: Promise<{ tenantSlug: string; personId: string }>;
};

export default async function PersonPrivacyPage({ params }: PersonPrivacyPageProps) {
  const { tenantSlug, personId } = await params;
  const session = await getAdminSessionContext(tenantSlug, await headers());
  const pageTitle = t("admin.persons.privacy.title");

  if (!session) {
    redirect(`/${tenantSlug}/login`);
  }

  if (!canExportPerson(session.roles, session.locationIds)) {
    return (
      <SurfaceShell surface="admin" title={pageTitle}>
        <Stack spacing={2}>
          <Stack direction="row" sx={{ justifyContent: "flex-end" }}>
            <StaffLogoutButton tenantSlug={tenantSlug} />
          </Stack>
          <SettingsForbidden tenantSlug={tenantSlug} title={pageTitle} />
        </Stack>
      </SurfaceShell>
    );
  }

  const persons = await listPersons(session);
  const person = persons.find((entry) => entry.id === personId);

  if (!person) {
    notFound();
  }

  return (
    <SurfaceShell surface="admin" title={pageTitle}>
      <Stack spacing={4}>
        <Stack direction="row" spacing={1} sx={{ justifyContent: "space-between", flexWrap: "wrap" }}>
          <Stack direction="row" spacing={1}>
            <Link href={`/${tenantSlug}`}>{t("admin.nav.dashboard")}</Link>
            <Link href={`/${tenantSlug}/crm/persons`}>{t("admin.nav.persons")}</Link>
          </Stack>
          <StaffLogoutButton tenantSlug={tenantSlug} />
        </Stack>

        <Stack spacing={1}>
          <Typography variant="h6">
            {person.firstName} {person.lastName}
          </Typography>
          <Typography color="text.secondary">{t("admin.persons.privacy.description")}</Typography>
        </Stack>

        <ExportPersonButton tenantSlug={tenantSlug} personId={personId} />
      </Stack>
    </SurfaceShell>
  );
}
