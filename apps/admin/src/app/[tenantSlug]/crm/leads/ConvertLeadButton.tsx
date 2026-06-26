"use client";

import { useT } from "@afterhive/ui";
import { Alert, Button } from "@mui/material";
import { useRouter } from "next/navigation";
import { useState } from "react";

type ConvertLeadButtonProps = {
  tenantSlug: string;
  leadId: string;
};

export function ConvertLeadButton({ tenantSlug, leadId }: ConvertLeadButtonProps) {
  const t = useT();
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  function mapConvertLeadError(code?: string) {
    switch (code) {
      case "invalid_status":
        return t("admin.leads.convert.error.invalidStatus");
      case "already_converted":
        return t("admin.leads.convert.error.alreadyConverted");
      case "location_forbidden":
      case "forbidden":
        return t("admin.leads.convert.error.forbidden");
      case "lead_not_found":
        return t("admin.leads.convert.error.notFound");
      default:
        return t("admin.leads.convert.error.default");
    }
  }

  async function onConvert() {
    setError(null);
    setLoading(true);

    try {
      const response = await fetch(`/app/api/leads/${leadId}/convert`, {
        method: "POST",
        headers: {
          "x-tenant-slug": tenantSlug,
        },
      });

      if (!response.ok) {
        let payload: { error?: string } = {};
        try {
          payload = (await response.json()) as { error?: string };
        } catch {
          payload = {};
        }
        setError(mapConvertLeadError(payload.error));
        setLoading(false);
        return;
      }

      setLoading(false);
      router.refresh();
    } catch {
      setError(mapConvertLeadError());
      setLoading(false);
    }
  }

  return (
    <>
      {error ? (
        <Alert severity="error" sx={{ mb: 1 }}>
          {error}
        </Alert>
      ) : null}
      <Button size="small" variant="outlined" disabled={loading} onClick={onConvert}>
        {t("admin.leads.convert.button")}
      </Button>
    </>
  );
}
