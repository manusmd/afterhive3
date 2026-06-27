import { canAssignRoles } from "@afterhive/api/auth/can-assign-roles";
import { getAdminSessionContext } from "@afterhive/api/auth/get-admin-session";
import { listPendingStaffInvites } from "@afterhive/api/auth/invite-staff";
import { listTenantLocations } from "@afterhive/api/auth/tenant-locations";
import { createTranslator, DEFAULT_LOCALE, getMessages, translateStaffRole } from "@afterhive/shared/i18n";
import { Panel, StatusChip } from "@afterhive/ui";
import { Chip, Stack, Typography } from "@mui/material";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { AdminPageFrame } from "@/components/AdminPageFrame";
import { SettingsForbidden } from "@/components/SettingsForbidden";
import { InviteStaffForm } from "./InviteStaffForm";

const t = createTranslator(getMessages(DEFAULT_LOCALE));

type TeamSettingsPageProps = {
  params: Promise<{ tenantSlug: string }>;
};

export default async function TeamSettingsPage({ params }: TeamSettingsPageProps) {
  const { tenantSlug } = await params;
  const session = await getAdminSessionContext(tenantSlug, await headers());

  if (!session) {
    redirect(`/${tenantSlug}/login`);
  }

  const teamTitle = t("admin.team.title");

  if (!canAssignRoles(session.roles)) {
    return (
      <AdminPageFrame title={teamTitle}>
        <SettingsForbidden tenantSlug={tenantSlug} />
      </AdminPageFrame>
    );
  }

  const tenantLocations = await listTenantLocations(tenantSlug);
  const pendingInvites = await listPendingStaffInvites(tenantSlug);

  return (
    <AdminPageFrame title={teamTitle}>
      <Stack spacing={2}>
        <Panel>
          <InviteStaffForm tenantSlug={tenantSlug} locations={tenantLocations} />
        </Panel>
        <Panel>
          <Typography variant="h6" sx={{ mb: 2 }}>
            {t("admin.team.pendingInvites.title")}
          </Typography>
          {pendingInvites.length === 0 ? (
            <Typography color="text.secondary">{t("admin.team.pendingInvites.empty")}</Typography>
          ) : (
            <Stack spacing={1.5}>
              {pendingInvites.map((invite) => (
                <Stack
                  key={invite.id}
                  direction="row"
                  spacing={1}
                  sx={{ flexWrap: "wrap", alignItems: "center" }}
                  useFlexGap
                >
                  <Typography>{invite.email}</Typography>
                  <StatusChip label={translateStaffRole(t, invite.role)} />
                  {invite.locationIds?.length ? (
                    <Chip
                      label={invite.locationIds
                        .map(
                          (id) =>
                            tenantLocations.find((location) => location.id === id)?.name ?? id,
                        )
                        .join(", ")}
                      size="small"
                      variant="outlined"
                    />
                  ) : (
                    <Chip
                      label={t("admin.team.pendingInvites.allLocations")}
                      size="small"
                      variant="outlined"
                    />
                  )}
                </Stack>
              ))}
            </Stack>
          )}
        </Panel>
      </Stack>
    </AdminPageFrame>
  );
}
