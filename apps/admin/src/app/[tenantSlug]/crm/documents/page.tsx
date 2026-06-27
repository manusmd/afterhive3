import { getAdminSessionContext } from "@afterhive/api/auth/get-admin-session";
import { canUploadDocument } from "@afterhive/api/document/can-upload-document";
import { createTranslator, DEFAULT_LOCALE, getMessages } from "@afterhive/shared/i18n";
import { Panel } from "@afterhive/ui";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { AdminPageFrame } from "@/components/AdminPageFrame";
import { SettingsForbidden } from "@/components/SettingsForbidden";
import { UploadDocumentForm } from "./UploadDocumentForm";

const t = createTranslator(getMessages(DEFAULT_LOCALE));

type DocumentsPageProps = {
  params: Promise<{ tenantSlug: string }>;
};

export default async function DocumentsPage({ params }: DocumentsPageProps) {
  const { tenantSlug } = await params;
  const session = await getAdminSessionContext(tenantSlug, await headers());
  const pageTitle = t("admin.documents.title");

  if (!session) {
    redirect(`/${tenantSlug}/login`);
  }

  if (!canUploadDocument(session.roles)) {
    return (
      <AdminPageFrame title={pageTitle}>
        <SettingsForbidden tenantSlug={tenantSlug} />
      </AdminPageFrame>
    );
  }

  return (
    <AdminPageFrame title={pageTitle}>
      <Panel>
        <UploadDocumentForm tenantSlug={tenantSlug} />
      </Panel>
    </AdminPageFrame>
  );
}
