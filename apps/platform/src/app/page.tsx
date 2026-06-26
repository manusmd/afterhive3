import { SurfaceShell } from "@afterhive/ui";
import { Typography } from "@mui/material";

export default function HomePage() {
  return (
    <SurfaceShell surface="platform" title="Platform Backoffice">
      <Typography color="text.secondary">
        Foundation shell — tenant lifecycle ships in EPIC-001.
      </Typography>
    </SurfaceShell>
  );
}
