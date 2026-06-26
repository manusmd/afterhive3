import { getAdminSessionContext } from "@afterhive/api/auth/get-admin-session";
import { canUploadDocument } from "@afterhive/api/document/can-upload-document";
import { createTranslator, DEFAULT_LOCALE, getMessages } from "@afterhive/shared/i18n";
import { SurfaceShell } from "@afterhive/ui";
import { Stack } from "@mui/material";
import Link from "next/link";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { SettingsForbidden } from "@/components/SettingsForbidden";
import { StaffLogoutButton } from "@/components/StaffLogoutButton";
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

  return (
    <SurfaceShell surface="admin" title={pageTitle}>
      <Stack spacing={4}>
        <Stack direction="row" spacing={1} sx={{ justifyContent: "space-between", flexWrap: "wrap" }}>
          <Stack direction="row" spacing={1}>
            <Link href={`/${tenantSlug}`}>{t("admin.nav.dashboard")}</Link>
          </Stack>
          <StaffLogoutButton tenantSlug={tenantSlug} />
        </Stack>
        <UploadDocumentForm tenantSlug={tenantSlug} />
      </Stack>
    </SurfaceShell>
  );
}
