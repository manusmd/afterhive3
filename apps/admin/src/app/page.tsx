import { Typography } from "@mui/material";
import Link from "next/link";
import { SurfaceShell } from "@afterhive/ui";

export default function AdminHomePage() {
  return (
    <SurfaceShell surface="admin" title="Tenant Admin">
      <Typography color="text.secondary">
        Oeffnen Sie{" "}
        <Link href="/app/demo-club/login">/app/demo-club/login</Link> fuer die Demo-Anmeldung.
      </Typography>
    </SurfaceShell>
  );
}
