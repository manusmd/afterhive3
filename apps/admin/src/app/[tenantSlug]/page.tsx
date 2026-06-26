import { getAdminSessionContext } from "@afterhive/api/auth/get-admin-session";
import { SurfaceShell } from "@afterhive/ui";
import { Chip, Stack, Typography } from "@mui/material";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

type TenantDashboardProps = {
  params: Promise<{ tenantSlug: string }>;
};

export default async function TenantDashboardPage({ params }: TenantDashboardProps) {
  const { tenantSlug } = await params;
  const session = await getAdminSessionContext(tenantSlug, await headers());

  if (!session) {
    redirect(`/${tenantSlug}/login`);
  }

  return (
    <SurfaceShell surface="admin" title="Dashboard">
      <Stack spacing={2}>
        <Typography color="text.secondary">
          Angemeldet als {session.userId} in {session.tenantSlug}
        </Typography>
        <Stack direction="row" spacing={1} sx={{ flexWrap: "wrap" }} useFlexGap>
          {session.roles.map((role) => (
            <Chip key={role} label={role} size="small" />
          ))}
        </Stack>
        <Typography variant="body2">
          Standort-Scope:{" "}
          {session.locationIds?.length
            ? session.locationIds.join(", ")
            : "alle Standorte"}
        </Typography>
      </Stack>
    </SurfaceShell>
  );
}
