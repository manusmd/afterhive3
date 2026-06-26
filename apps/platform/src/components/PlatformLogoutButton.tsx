"use client";

import { useT } from "@afterhive/ui";
import { Button } from "@mui/material";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { authClient } from "@/lib/auth-client";

export function PlatformLogoutButton() {
  const t = useT();
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function logout() {
    setLoading(true);
    await authClient.signOut();
    router.push("/login");
    router.refresh();
  }

  return (
    <Button variant="outlined" onClick={logout} disabled={loading}>
      {t("common.logout")}
    </Button>
  );
}
