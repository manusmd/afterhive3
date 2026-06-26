import { SurfaceShell } from "@afterhive/ui";
import { Typography } from "@mui/material";

export default function HomePage() {
  return (
    <SurfaceShell surface="marketplace" title="Marketplace">
      <Typography color="text.secondary">
        Foundation shell — public discovery ships in EPIC-050.
      </Typography>
    </SurfaceShell>
  );
}
