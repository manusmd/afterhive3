import { getPortalSessionContext } from "@afterhive/api/auth/get-portal-session";
import { listConsentTargets } from "@afterhive/api/portal/grant-consent";
import { createTranslator, DEFAULT_LOCALE, getMessages } from "@afterhive/shared/i18n";
import { SurfaceShell } from "@afterhive/ui";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { ConsentGrantForm } from "./ConsentGrantForm";

const t = createTranslator(getMessages(DEFAULT_LOCALE));

type ConsentPageProps = {
  params: Promise<{ tenantSlug: string }>;
};

export default async function ConsentPage({ params }: ConsentPageProps) {
  const { tenantSlug } = await params;
  const session = await getPortalSessionContext(tenantSlug, await headers());

  if (!session) {
    redirect(`/${tenantSlug}/login`);
  }

  const targets = await listConsentTargets(session);

  return (
    <SurfaceShell surface="portal" title={t("portal.consent.title")}>
      <ConsentGrantForm tenantSlug={tenantSlug} targets={targets} />
    </SurfaceShell>
  );
}
