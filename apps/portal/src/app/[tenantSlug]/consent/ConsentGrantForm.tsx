"use client";

import { useT } from "@afterhive/ui";
import { Alert, Button, Stack, Typography } from "@mui/material";
import { useRouter } from "next/navigation";
import { useState } from "react";

type ConsentTarget = {
  personId: string;
  firstName: string;
  lastName: string;
  consentStatus: string;
};

type ConsentGrantFormProps = {
  tenantSlug: string;
  targets: ConsentTarget[];
};

export function ConsentGrantForm({ tenantSlug, targets }: ConsentGrantFormProps) {
  const t = useT();
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loadingPersonId, setLoadingPersonId] = useState<string | null>(null);

  function mapGrantError(code?: string) {
    switch (code) {
      case "not_guardian":
        return t("portal.consent.error.notGuardian");
      case "already_granted":
        return t("portal.consent.error.alreadyGranted");
      case "person_not_found":
        return t("portal.consent.error.personNotFound");
      default:
        return t("portal.consent.error.default");
    }
  }

  async function onGrant(personId: string, name: string) {
    setError(null);
    setSuccess(null);
    setLoadingPersonId(personId);

    try {
      const response = await fetch("/portal/api/consent/grant", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-tenant-slug": tenantSlug,
        },
        body: JSON.stringify({ minorPersonId: personId, type: "enrollment" }),
      });

      if (!response.ok) {
        let payload: { error?: string } = {};
        try {
          payload = (await response.json()) as { error?: string };
        } catch {
          payload = {};
        }
        setError(mapGrantError(payload.error));
        setLoadingPersonId(null);
        return;
      }

      setSuccess(t("portal.consent.success", { name }));
      setLoadingPersonId(null);
      router.refresh();
    } catch {
      setError(mapGrantError());
      setLoadingPersonId(null);
    }
  }

  if (targets.length === 0) {
    return (
      <Typography color="text.secondary">{t("portal.consent.empty")}</Typography>
    );
  }

  return (
    <Stack spacing={2}>
      {error ? <Alert severity="error">{error}</Alert> : null}
      {success ? <Alert severity="success">{success}</Alert> : null}
      {targets.map((target) => {
        const name = `${target.firstName} ${target.lastName}`;
        return (
          <Stack
            key={target.personId}
            direction="row"
            spacing={2}
            sx={{ alignItems: "center", justifyContent: "space-between", flexWrap: "wrap" }}
          >
            <Typography>{name}</Typography>
            <Button
              variant="contained"
              disabled={loadingPersonId === target.personId}
              onClick={() => onGrant(target.personId, name)}
            >
              {loadingPersonId === target.personId
                ? t("portal.consent.granting")
                : t("portal.consent.grant")}
            </Button>
          </Stack>
        );
      })}
    </Stack>
  );
}
