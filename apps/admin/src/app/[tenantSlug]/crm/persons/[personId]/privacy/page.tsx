import { getAdminSessionContext } from "@afterhive/api/auth/get-admin-session";
import { listPersons } from "@afterhive/api/crm/list-persons";
import { canExportPerson } from "@afterhive/api/gdpr/can-export-person";
import { canAnonymizePerson } from "@afterhive/api/gdpr/can-anonymize-person";
import { createTranslator, DEFAULT_LOCALE, getMessages } from "@afterhive/shared/i18n";
import { Panel } from "@afterhive/ui";
import { Stack, Typography } from "@mui/material";
import { headers } from "next/headers";
import { notFound, redirect } from "next/navigation";
import { AdminPageFrame } from "@/components/AdminPageFrame";
import { SettingsForbidden } from "@/components/SettingsForbidden";
import { ExportPersonButton } from "./ExportPersonButton";
import { AnonymizePersonButton } from "./AnonymizePersonButton";

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

  const canExport = canExportPerson(
    session.roles,
    session.locationIds,
    session.roleAssignments,
  );
  const canAnonymize = canAnonymizePerson(
    session.roles,
    session.locationIds,
    session.roleAssignments,
  );

  if (!canExport && !canAnonymize) {
    return (
      <AdminPageFrame title={pageTitle}>
        <SettingsForbidden tenantSlug={tenantSlug} />
      </AdminPageFrame>
    );
  }

  const persons = await listPersons(session);
  const person = persons.find((entry) => entry.id === personId);

  if (!person) {
    notFound();
  }

  return (
    <AdminPageFrame
      title={pageTitle}
      subtitle={`${person.firstName} ${person.lastName}`}
    >
      <Stack spacing={2}>
        <Panel>
          <Typography color="text.secondary" sx={{ mb: 3 }}>
            {t("admin.persons.privacy.description")}
          </Typography>
          <Stack spacing={3}>
            {canExport ? <ExportPersonButton tenantSlug={tenantSlug} personId={personId} /> : null}
            {canAnonymize ? (
              <AnonymizePersonButton tenantSlug={tenantSlug} personId={personId} />
            ) : null}
          </Stack>
        </Panel>
      </Stack>
    </AdminPageFrame>
  );
}
