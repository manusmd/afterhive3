import { getPortalSessionContext } from "@afterhive/api/auth/get-portal-session";
import { listPortalDocuments } from "@afterhive/api/document/list-portal-documents";
import { createTranslator, DEFAULT_LOCALE, getMessages } from "@afterhive/shared/i18n";
import { SurfaceShell } from "@afterhive/ui";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
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
    <SurfaceShell surface="portal" title={t("portal.documents.title")}>
      <PortalDocumentsList tenantSlug={tenantSlug} documents={documents} />
    </SurfaceShell>
  );
}
