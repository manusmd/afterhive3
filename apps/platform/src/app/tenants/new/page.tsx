import { getPlatformSessionContext } from "@afterhive/api/auth/get-platform-session";
import { canCreateTenant } from "@afterhive/api/platform/can-create-tenant";
import { SurfaceShell } from "@afterhive/ui";
import { Button, Stack } from "@mui/material";
import Link from "next/link";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { PlatformToolbar } from "@/components/PlatformToolbar";
import { CreateTenantForm } from "./CreateTenantForm";

export default async function CreateTenantPage() {
  const session = await getPlatformSessionContext(await headers());

  if (!session) {
    redirect("/login");
  }

  if (!canCreateTenant(session.roles)) {
    redirect("/");
  }

  return (
    <SurfaceShell surface="platform" title="Tenant anlegen">
      <Stack spacing={3}>
        <PlatformToolbar />
        <Link href="/tenants">
          <Button sx={{ alignSelf: "flex-start" }}>Zurueck zur Liste</Button>
        </Link>
        <CreateTenantForm />
      </Stack>
    </SurfaceShell>
  );
}
