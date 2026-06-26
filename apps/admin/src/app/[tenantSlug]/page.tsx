import { canAssignRoles } from "@afterhive/api/auth/can-assign-roles";
import { getAdminSessionContext } from "@afterhive/api/auth/get-admin-session";
import { canReadLeads } from "@afterhive/api/crm/can-read-leads";
import { canViewLocations } from "@afterhive/api/location/can-manage-locations";
import { SurfaceShell } from "@afterhive/ui";
import { Button, Chip, Stack, Typography } from "@mui/material";
import Link from "next/link";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { StaffLogoutButton } from "@/components/StaffLogoutButton";

type TenantDashboardProps = {
  params: Promise<{ tenantSlug: string }>;
};

export default async function TenantDashboardPage({ params }: TenantDashboardProps) {
  const { tenantSlug } = await params;
  const session = await getAdminSessionContext(tenantSlug, await headers());

  if (!session) {
    redirect(`/${tenantSlug}/login`);
  }

  const showLocations = canViewLocations(session.roles);
  const showTeam = canAssignRoles(session.roles);
  const showLeads = canReadLeads(session.roles, session.locationIds);

  return (
    <SurfaceShell surface="admin" title="Dashboard">
      <Stack spacing={2}>
        <Stack direction="row" sx={{ justifyContent: "flex-end" }}>
          <StaffLogoutButton tenantSlug={tenantSlug} />
        </Stack>
        <Typography color="text.secondary">
          Angemeldet als {session.userId} in {session.tenantSlug}
        </Typography>
        {showLeads || showLocations || showTeam ? (
          <Stack direction="row" spacing={1} sx={{ flexWrap: "wrap" }} useFlexGap>
            {showLeads ? (
              <Link href={`/${tenantSlug}/crm/leads`}>
                <Button variant="outlined">Leads</Button>
              </Link>
            ) : null}
            {showLocations ? (
              <Link href={`/${tenantSlug}/settings/locations`}>
                <Button variant="outlined">Standorte</Button>
              </Link>
            ) : null}
            {showTeam ? (
              <Link href={`/${tenantSlug}/settings/team`}>
                <Button variant="outlined">Team</Button>
              </Link>
            ) : null}
          </Stack>
        ) : null}
        <Stack direction="row" spacing={1} sx={{ flexWrap: "wrap" }} useFlexGap>
          {session.roles.map((role) => (
            <Chip key={role} label={role} size="small" />
          ))}
        </Stack>
        <Typography variant="body2">
          Sichtbare Standorte:{" "}
          {session.locationIds === undefined
            ? "alle Standorte"
            : session.locationIds.length === 0
              ? "keine zugewiesen"
              : session.locationIds.join(", ")}
        </Typography>
      </Stack>
    </SurfaceShell>
  );
}
