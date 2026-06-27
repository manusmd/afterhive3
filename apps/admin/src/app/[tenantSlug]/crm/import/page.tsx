import { getAdminSessionContext } from "@afterhive/api/auth/get-admin-session";
import { canRunImport } from "@afterhive/api/crm/can-run-import";
import { listImportFormLocations } from "@afterhive/api/crm/import-leads-csv";
import { createTranslator, DEFAULT_LOCALE, getMessages } from "@afterhive/shared/i18n";
import { Panel } from "@afterhive/ui";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { AdminPageFrame } from "@/components/AdminPageFrame";
import { SettingsForbidden } from "@/components/SettingsForbidden";
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
      <AdminPageFrame title={importTitle}>
        <SettingsForbidden tenantSlug={tenantSlug} />
      </AdminPageFrame>
    );
  }

  const locations = await listImportFormLocations(session, tenantSlug);

  return (
    <AdminPageFrame title={importTitle}>
      <Panel>
        <ImportLeadsForm tenantSlug={tenantSlug} locations={locations} />
      </Panel>
    </AdminPageFrame>
  );
}
