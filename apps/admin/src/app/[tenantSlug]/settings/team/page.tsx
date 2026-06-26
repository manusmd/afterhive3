import { canAssignRoles } from "@afterhive/api/auth/can-assign-roles";
import { getAdminSessionContext } from "@afterhive/api/auth/get-admin-session";
import { listPendingStaffInvites } from "@afterhive/api/auth/invite-staff";
import { listTenantLocations } from "@afterhive/api/auth/tenant-locations";
import { canViewLocations } from "@afterhive/api/location/can-manage-locations";
import { SurfaceShell } from "@afterhive/ui";
import { Chip, Stack, Typography } from "@mui/material";
import Link from "next/link";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { SettingsForbidden } from "@/components/SettingsForbidden";
import { StaffLogoutButton } from "@/components/StaffLogoutButton";
import { InviteStaffForm } from "./InviteStaffForm";

type TeamSettingsPageProps = {
  params: Promise<{ tenantSlug: string }>;
};

export default async function TeamSettingsPage({ params }: TeamSettingsPageProps) {
  const { tenantSlug } = await params;
  const session = await getAdminSessionContext(tenantSlug, await headers());

  if (!session) {
    redirect(`/${tenantSlug}/login`);
  }

  if (!canAssignRoles(session.roles)) {
    return (
      <SurfaceShell surface="admin" title="Team & Rollen">
        <Stack spacing={2}>
          <Stack direction="row" sx={{ justifyContent: "flex-end" }}>
            <StaffLogoutButton tenantSlug={tenantSlug} />
          </Stack>
          <SettingsForbidden tenantSlug={tenantSlug} title="Team & Rollen" />
        </Stack>
      </SurfaceShell>
    );
  }

  const tenantLocations = await listTenantLocations(tenantSlug);
  const pendingInvites = await listPendingStaffInvites(tenantSlug);
  const showLocations = canViewLocations(session.roles);

  return (
    <SurfaceShell surface="admin" title="Team & Rollen">
      <Stack spacing={4}>
        <Stack direction="row" spacing={1} sx={{ justifyContent: "space-between", flexWrap: "wrap" }}>
          <Stack direction="row" spacing={1}>
            <Link href={`/${tenantSlug}`}>Dashboard</Link>
            {showLocations ? (
              <Link href={`/${tenantSlug}/settings/locations`}>Standorte</Link>
            ) : null}
          </Stack>
          <StaffLogoutButton tenantSlug={tenantSlug} />
        </Stack>
        <InviteStaffForm tenantSlug={tenantSlug} locations={tenantLocations} />
        <Stack spacing={1}>
          <Typography variant="h6">Offene Einladungen</Typography>
          {pendingInvites.length === 0 ? (
            <Typography color="text.secondary">Keine offenen Einladungen.</Typography>
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
                  <Chip label="alle Standorte" size="small" variant="outlined" />
                )}
              </Stack>
            ))
          )}
        </Stack>
      </Stack>
    </SurfaceShell>
  );
}
