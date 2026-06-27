import { getPortalSessionContext } from "@afterhive/api/auth/get-portal-session";
import { listPortalDocuments } from "@afterhive/api/document/list-portal-documents";
import { createTranslator, DEFAULT_LOCALE, getMessages } from "@afterhive/shared/i18n";
import { Panel } from "@afterhive/ui";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { PortalLogoutButton } from "@/components/PortalLogoutButton";
import { PortalPageFrame } from "@/components/PortalPageFrame";
import { PortalDocumentsList } from "./PortalDocumentsList";

const t = createTranslator(getMessages(DEFAULT_LOCALE));

type DocumentsPageProps = {
  params: Promise<{ tenantSlug: string }>;
};

export default async function DocumentsPage({ params }: DocumentsPageProps) {
  const { tenantSlug } = await params;
  const session = await getPortalSessionContext(tenantSlug, await headers());

  if (!session) {
    redirect(`/${tenantSlug}/login`);
  }

  const documents = await listPortalDocuments(session, tenantSlug);

  return (
    <PortalPageFrame
      title={t("portal.documents.title")}
      actions={<PortalLogoutButton tenantSlug={tenantSlug} />}
    >
      <Panel>
        <PortalDocumentsList tenantSlug={tenantSlug} documents={documents} />
      </Panel>
    </PortalPageFrame>
  );
}
