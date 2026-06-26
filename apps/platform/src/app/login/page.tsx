import { SurfaceShell } from "@afterhive/ui";
import { Typography } from "@mui/material";
import { PlatformLoginForm } from "./PlatformLoginForm";

export default function PlatformLoginPage() {
  return (
    <SurfaceShell surface="platform" title="Platform Login">
      <Typography color="text.secondary" sx={{ mb: 3 }}>
        Melden Sie sich als Plattform-Administrator an. Demo: platform@afterhive.de
      </Typography>
      <PlatformLoginForm />
    </SurfaceShell>
  );
}
