import { getAdminSessionContext } from "@afterhive/api/auth/get-admin-session";
import {
  canCreateLocation,
  canViewLocations,
} from "@afterhive/api/location/can-manage-locations";
import { listLocations } from "@afterhive/api/location/list-locations";
import { SurfaceShell } from "@afterhive/ui";
import { Box, Stack, Typography } from "@mui/material";
import Link from "next/link";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { StaffLogoutButton } from "@/components/StaffLogoutButton";
import { CreateLocationForm } from "./CreateLocationForm";

type LocationsSettingsPageProps = {
  params: Promise<{ tenantSlug: string }>;
};

export default async function LocationsSettingsPage({ params }: LocationsSettingsPageProps) {
  const { tenantSlug } = await params;
  const session = await getAdminSessionContext(tenantSlug, await headers());

  if (!session) {
    redirect(`/${tenantSlug}/login`);
  }

  if (!canViewLocations(session.roles)) {
    redirect(`/${tenantSlug}`);
  }

  const locations = await listLocations(tenantSlug);
  const showCreateForm = canCreateLocation(session.roles);

  return (
    <SurfaceShell surface="admin" title="Standorte">
      <Stack spacing={4}>
        <Stack direction="row" spacing={1} sx={{ justifyContent: "space-between", flexWrap: "wrap" }}>
          <Stack direction="row" spacing={1}>
            <Link href={`/${tenantSlug}`}>Dashboard</Link>
            <Link href={`/${tenantSlug}/settings/team`}>Team</Link>
          </Stack>
          <StaffLogoutButton tenantSlug={tenantSlug} />
        </Stack>

        {showCreateForm ? <CreateLocationForm tenantSlug={tenantSlug} /> : null}

        <Stack spacing={2}>
          <Typography variant="h6">Standorte ({locations.length})</Typography>
          {locations.length === 0 ? (
            <Typography color="text.secondary">
              Mindestens ein Standort ist erforderlich. Legen Sie den ersten Standort an.
            </Typography>
          ) : (
            <>
              <Box sx={{ display: { xs: "none", md: "block" } }}>
                <Box component="table" sx={{ width: "100%", borderCollapse: "collapse" }}>
                  <Box component="thead">
                    <Box component="tr">
                      {["Name", "Erstellt"].map((heading) => (
                        <Box
                          component="th"
                          key={heading}
                          sx={{
                            textAlign: "left",
                            py: 1.5,
                            px: 1,
                            borderBottom: 1,
                            borderColor: "divider",
                            typography: "subtitle2",
                          }}
                        >
                          {heading}
                        </Box>
                      ))}
                    </Box>
                  </Box>
                  <Box component="tbody">
                    {locations.map((location) => (
                      <Box component="tr" key={location.id}>
                        <Box
                          component="td"
                          sx={{ py: 1.5, px: 1, borderBottom: 1, borderColor: "divider" }}
                        >
                          {location.name}
                        </Box>
                        <Box
                          component="td"
                          sx={{ py: 1.5, px: 1, borderBottom: 1, borderColor: "divider" }}
                        >
                          {formatDate(location.createdAt)}
                        </Box>
                      </Box>
                    ))}
                  </Box>
                </Box>
              </Box>

              <Stack spacing={1.5} sx={{ display: { xs: "flex", md: "none" } }}>
                {locations.map((location) => (
                  <Box
                    key={location.id}
                    sx={{
                      p: 2,
                      border: 1,
                      borderColor: "divider",
                      borderRadius: 1,
                    }}
                  >
                    <Typography variant="subtitle1">{location.name}</Typography>
                    <Typography variant="caption" color="text.secondary">
                      {formatDate(location.createdAt)}
                    </Typography>
                  </Box>
                ))}
              </Stack>
            </>
          )}
        </Stack>
      </Stack>
    </SurfaceShell>
  );
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("de-DE", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}
