"use client";

import { useT } from "@afterhive/ui";
import { Alert, Button, CircularProgress, Stack } from "@mui/material";
import { useState } from "react";

type ExportPersonButtonProps = {
  tenantSlug: string;
  personId: string;
};

export function ExportPersonButton({ tenantSlug, personId }: ExportPersonButtonProps) {
  const t = useT();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  function mapExportError(code?: string) {
    switch (code) {
      case "person_not_found":
        return t("admin.persons.privacy.export.error.personNotFound");
      case "location_forbidden":
        return t("admin.persons.privacy.export.error.forbidden");
      case "forbidden":
        return t("admin.persons.privacy.export.error.forbidden");
      default:
        return t("admin.persons.privacy.export.error.default");
    }
  }

  async function onExport() {
    setError(null);
    setLoading(true);

    try {
      const response = await fetch(`/app/api/crm/persons/${personId}/export`, {
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
        setError(mapExportError(payload.error ?? (response.status === 403 ? "forbidden" : undefined)));
        setLoading(false);
        return;
      }

      const blob = await response.blob();
      const fileName =
        response.headers.get("Content-Disposition")?.match(/filename="([^"]+)"/)?.[1] ??
        `person-export-${personId}.zip`;
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = fileName;
      anchor.click();
      URL.revokeObjectURL(url);
      setLoading(false);
    } catch {
      setError(mapExportError());
      setLoading(false);
    }
  }

  return (
    <Stack spacing={2}>
      {error ? <Alert severity="error">{error}</Alert> : null}
      <Button
        variant="contained"
        disabled={loading}
        onClick={onExport}
        startIcon={loading ? <CircularProgress color="inherit" size={16} /> : undefined}
      >
        {loading ? t("admin.persons.privacy.export.submitting") : t("admin.persons.privacy.export.submit")}
      </Button>
    </Stack>
  );
}
