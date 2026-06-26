import { getPlatformSessionContext } from "@afterhive/api/auth/get-platform-session";
import { canCreateTenant } from "@afterhive/api/platform/can-create-tenant";
import { SurfaceShell } from "@afterhive/ui";
import { Stack } from "@mui/material";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { PlatformLogoutButton } from "@/components/PlatformLogoutButton";
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
        <Stack direction="row" sx={{ justifyContent: "flex-end" }}>
          <PlatformLogoutButton />
        </Stack>
        <CreateTenantForm />
      </Stack>
    </SurfaceShell>
  );
}
