import { Stack, Typography } from "@mui/material";
import Link from "next/link";

type SettingsForbiddenProps = {
  tenantSlug: string;
  title: string;
};

export function SettingsForbidden({ tenantSlug, title }: SettingsForbiddenProps) {
  return (
    <Stack spacing={2}>
      <Typography variant="h6">{title}</Typography>
      <Typography color="text.secondary">
        Ihr Konto hat keine Berechtigung fuer diesen Bereich.
      </Typography>
      <Link href={`/${tenantSlug}`}>Zurueck zum Dashboard</Link>
    </Stack>
  );
}
