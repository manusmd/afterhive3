"use client";

import { useT } from "@afterhive/ui";
import { Button, Stack } from "@mui/material";
import Link from "next/link";
import { PlatformLogoutButton } from "./PlatformLogoutButton";

type PlatformToolbarProps = {
  showCreateTenant?: boolean;
};

export function PlatformToolbar({ showCreateTenant = false }: PlatformToolbarProps) {
  const t = useT();

  return (
    <Stack direction="row" spacing={1} sx={{ justifyContent: "flex-end", flexWrap: "wrap" }}>
      {showCreateTenant ? (
        <Button component={Link} href="/tenants/new" variant="outlined">
          {t("platform.tenants.create.toolbarButton")}
        </Button>
      ) : null}
      <PlatformLogoutButton />
    </Stack>
  );
}
