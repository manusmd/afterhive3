import { SurfaceShell } from "@afterhive/ui";
import { Typography } from "@mui/material";

export default function HomePage() {
  return (
    <SurfaceShell surface="portal" title="Self-Service Portal">
      <Typography color="text.secondary">
        Foundation shell — member flows ship in EPIC-040.
      </Typography>
    </SurfaceShell>
  );
}
