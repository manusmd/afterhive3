import { getStaffInviteByToken } from "@afterhive/api/auth/invite-staff";
import { createTranslator, DEFAULT_LOCALE, getMessages } from "@afterhive/shared/i18n";
import { SurfaceShell } from "@afterhive/ui";
import { Typography } from "@mui/material";
import { AcceptInviteForm } from "./AcceptInviteForm";

const t = createTranslator(getMessages(DEFAULT_LOCALE));

type AcceptInvitePageProps = {
  params: Promise<{ tenantSlug: string; token: string }>;
};

export default async function AcceptInvitePage({ params }: AcceptInvitePageProps) {
  const { tenantSlug, token } = await params;
  const invite = await getStaffInviteByToken(tenantSlug, token);

  if (!invite) {
    return (
      <SurfaceShell surface="admin" title={t("admin.invite.title.invalid")}>
        <Typography color="text.secondary">{t("admin.invite.invalidMessage")}</Typography>
      </SurfaceShell>
    );
  }

  return (
    <SurfaceShell surface="admin" title={t("admin.invite.title.accept")}>
      <AcceptInviteForm tenantSlug={tenantSlug} token={token} email={invite.email} />
    </SurfaceShell>
  );
}
