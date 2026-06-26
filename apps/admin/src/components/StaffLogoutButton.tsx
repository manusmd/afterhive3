"use client";

import { Button } from "@mui/material";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { authClient } from "@/lib/auth-client";

type StaffLogoutButtonProps = {
  tenantSlug: string;
};

export function StaffLogoutButton({ tenantSlug }: StaffLogoutButtonProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function logout() {
    setLoading(true);
    await authClient.signOut();
    router.push(`/${tenantSlug}/login`);
    router.refresh();
  }

  return (
    <Button variant="outlined" onClick={logout} disabled={loading}>
      Abmelden
    </Button>
  );
}
