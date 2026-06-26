"use client";

import { Button } from "@mui/material";
import { useRouter } from "next/navigation";
import { useState } from "react";
import type { TenantStatus } from "@afterhive/api/platform/list-tenants";

type SuspendTenantButtonProps = {
  tenantId: string;
  tenantName: string;
  status: TenantStatus;
};

export function SuspendTenantButton({ tenantId, tenantName, status }: SuspendTenantButtonProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (status === "suspended" || status === "closed") {
    return null;
  }

  async function onSuspend() {
    const confirmed = window.confirm(`Tenant "${tenantName}" wirklich sperren?`);

    if (!confirmed) {
      return;
    }

    setError(null);
    setLoading(true);

    const response = await fetch(`/platform/api/tenants/${tenantId}/suspend`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({}),
    });

    if (!response.ok) {
      const payload = (await response.json()) as { error?: string };
      setError(mapSuspendError(payload.error));
      setLoading(false);
      return;
    }

    router.refresh();
    setLoading(false);
  }

  return (
    <>
      {error ? (
        <Button size="small" color="error" disabled sx={{ minWidth: 0, px: 1 }}>
          {error}
        </Button>
      ) : (
        <Button size="small" color="warning" disabled={loading} onClick={onSuspend}>
          Sperren
        </Button>
      )}
    </>
  );
}

function mapSuspendError(code?: string) {
  switch (code) {
    case "already_suspended":
      return "Bereits gesperrt";
    case "already_closed":
      return "Geschlossen";
    case "forbidden":
      return "Keine Berechtigung";
    default:
      return "Sperren fehlgeschlagen";
  }
}
