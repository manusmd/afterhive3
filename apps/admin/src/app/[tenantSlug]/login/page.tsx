import { SurfaceShell } from "@afterhive/ui";
import { Typography } from "@mui/material";
import { LoginForm } from "./LoginForm";

type LoginPageProps = {
  params: Promise<{ tenantSlug: string }>;
};

export default async function LoginPage({ params }: LoginPageProps) {
  const { tenantSlug } = await params;

  return (
    <SurfaceShell surface="admin" title="Anmelden">
      <Typography color="text.secondary" sx={{ mb: 1 }}>
        Melden Sie sich als Mitarbeitende:r an.
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Demo: staff@demo-club.de fuer Buero-Zugang, owner@demo-club.de fuer Standorte und Team
        (Passwort Demo1234!).
      </Typography>
      <LoginForm tenantSlug={tenantSlug} />
    </SurfaceShell>
  );
}
