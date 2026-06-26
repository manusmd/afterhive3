"use client";

import { Button, Stack } from "@mui/material";
import Link from "next/link";
import { PlatformLogoutButton } from "./PlatformLogoutButton";

type PlatformToolbarProps = {
  showCreateTenant?: boolean;
};

export function PlatformToolbar({ showCreateTenant = false }: PlatformToolbarProps) {
  return (
    <Stack direction="row" spacing={1} sx={{ justifyContent: "flex-end", flexWrap: "wrap" }}>
      {showCreateTenant ? (
        <Button component={Link} href="/tenants/new" variant="outlined">
          Tenant anlegen
        </Button>
      ) : null}
      <PlatformLogoutButton />
    </Stack>
  );
}
