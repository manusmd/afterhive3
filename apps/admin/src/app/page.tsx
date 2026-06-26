import { SurfaceShell } from "@afterhive/ui";
import { Typography } from "@mui/material";

export default function HomePage() {
  return (
    <SurfaceShell surface="admin" title="Tenant Admin">
      <Typography color="text.secondary">
        Foundation shell — staff login ships in EPIC-002.
      </Typography>
    </SurfaceShell>
  );
}
