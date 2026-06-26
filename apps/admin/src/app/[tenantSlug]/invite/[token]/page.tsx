import { getStaffInviteByToken } from "@afterhive/api/auth/invite-staff";
import { SurfaceShell } from "@afterhive/ui";
import { Typography } from "@mui/material";
import { AcceptInviteForm } from "./AcceptInviteForm";

type AcceptInvitePageProps = {
  params: Promise<{ tenantSlug: string; token: string }>;
};

export default async function AcceptInvitePage({ params }: AcceptInvitePageProps) {
  const { tenantSlug, token } = await params;
  const invite = await getStaffInviteByToken(tenantSlug, token);

  if (!invite) {
    return (
      <SurfaceShell surface="admin" title="Einladung">
        <Typography color="text.secondary">
          Diese Einladung ist ungueltig oder abgelaufen.
        </Typography>
      </SurfaceShell>
    );
  }

  return (
    <SurfaceShell surface="admin" title="Einladung annehmen">
      <AcceptInviteForm tenantSlug={tenantSlug} token={token} email={invite.email} />
    </SurfaceShell>
  );
}
