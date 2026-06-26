import { getPlatformSessionContext } from "@afterhive/api/auth/get-platform-session";
import { SurfaceShell } from "@afterhive/ui";
import { Button, Stack, Typography } from "@mui/material";
import { headers } from "next/headers";
import Link from "next/link";
import { redirect } from "next/navigation";
import { PlatformLogoutButton } from "@/components/PlatformLogoutButton";

export default async function HomePage() {
  const session = await getPlatformSessionContext(await headers());

  if (session) {
    redirect("/tenants/new");
  }

  return (
    <SurfaceShell surface="platform" title="Platform Backoffice">
      <Stack spacing={2}>
        <Typography color="text.secondary">
          Melden Sie sich an, um Tenants zu verwalten.
        </Typography>
        <Button component={Link} href="/login" variant="contained">
          Zum Login
        </Button>
      </Stack>
    </SurfaceShell>
  );
}
