"use client";

import { useT } from "@afterhive/ui";
import { Alert, Button, CircularProgress, Stack } from "@mui/material";
import { useRouter } from "next/navigation";
import { useState } from "react";

type AnonymizePersonButtonProps = {
  tenantSlug: string;
  personId: string;
};

export function AnonymizePersonButton({ tenantSlug, personId }: AnonymizePersonButtonProps) {
  const t = useT();
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  function mapAnonymizeError(code?: string) {
    switch (code) {
      case "person_not_found":
        return t("admin.persons.privacy.anonymize.error.personNotFound");
      case "already_anonymized":
        return t("admin.persons.privacy.anonymize.error.alreadyAnonymized");
      case "location_forbidden":
        return t("admin.persons.privacy.anonymize.error.forbidden");
      case "forbidden":
        return t("admin.persons.privacy.anonymize.error.forbidden");
      default:
        return t("admin.persons.privacy.anonymize.error.default");
    }
  }

  async function onAnonymize() {
    setError(null);

    if (!window.confirm(t("admin.persons.privacy.anonymize.confirm"))) {
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(`/app/api/crm/persons/${personId}/anonymize`, {
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
        setError(
          mapAnonymizeError(payload.error ?? (response.status === 403 ? "forbidden" : undefined)),
        );
        setLoading(false);
        return;
      }

      router.push(`/${tenantSlug}/crm/persons`);
      setLoading(false);
    } catch {
      setError(mapAnonymizeError());
      setLoading(false);
    }
  }

  return (
    <Stack spacing={2}>
      {error ? <Alert severity="error">{error}</Alert> : null}
      <Button
        variant="outlined"
        color="error"
        disabled={loading}
        onClick={onAnonymize}
        startIcon={loading ? <CircularProgress color="inherit" size={16} /> : undefined}
      >
        {loading
          ? t("admin.persons.privacy.anonymize.submitting")
          : t("admin.persons.privacy.anonymize.submit")}
      </Button>
    </Stack>
  );
}
