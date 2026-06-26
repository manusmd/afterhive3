import { canAssignRoles } from "@afterhive/api/auth/can-assign-roles";
import { getAdminSessionContext } from "@afterhive/api/auth/get-admin-session";
import { listPendingStaffInvites } from "@afterhive/api/auth/invite-staff";
import { listTenantLocations } from "@afterhive/api/auth/tenant-locations";
import { canViewLocations } from "@afterhive/api/location/can-manage-locations";
import { createTranslator, DEFAULT_LOCALE, getMessages } from "@afterhive/shared/i18n";
import { SurfaceShell } from "@afterhive/ui";
import { Chip, Stack, Typography } from "@mui/material";
import Link from "next/link";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { SettingsForbidden } from "@/components/SettingsForbidden";
import { StaffLogoutButton } from "@/components/StaffLogoutButton";
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
      <SurfaceShell surface="admin" title={teamTitle}>
        <Stack spacing={2}>
          <Stack direction="row" sx={{ justifyContent: "flex-end" }}>
            <StaffLogoutButton tenantSlug={tenantSlug} />
          </Stack>
          <SettingsForbidden tenantSlug={tenantSlug} title={teamTitle} />
        </Stack>
      </SurfaceShell>
    );
  }

  const tenantLocations = await listTenantLocations(tenantSlug);
  const pendingInvites = await listPendingStaffInvites(tenantSlug);
  const showLocations = canViewLocations(session.roles);

  return (
    <SurfaceShell surface="admin" title={teamTitle}>
      <Stack spacing={4}>
        <Stack direction="row" spacing={1} sx={{ justifyContent: "space-between", flexWrap: "wrap" }}>
          <Stack direction="row" spacing={1}>
            <Link href={`/${tenantSlug}`}>{t("admin.nav.dashboard")}</Link>
            {showLocations ? (
              <Link href={`/${tenantSlug}/settings/locations`}>{t("admin.nav.locations")}</Link>
            ) : null}
          </Stack>
          <StaffLogoutButton tenantSlug={tenantSlug} />
        </Stack>
        <InviteStaffForm tenantSlug={tenantSlug} locations={tenantLocations} />
        <Stack spacing={1}>
          <Typography variant="h6">{t("admin.team.pendingInvites.title")}</Typography>
          {pendingInvites.length === 0 ? (
            <Typography color="text.secondary">{t("admin.team.pendingInvites.empty")}</Typography>
          ) : (
            pendingInvites.map((invite) => (
              <Stack
                key={invite.id}
                direction="row"
                spacing={1}
                sx={{ flexWrap: "wrap" }}
                useFlexGap
              >
                <Typography>{invite.email}</Typography>
                <Chip label={invite.role} size="small" />
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
            ))
          )}
        </Stack>
      </Stack>
    </SurfaceShell>
  );
}
