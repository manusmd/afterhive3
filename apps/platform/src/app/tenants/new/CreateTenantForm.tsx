"use client";

import { useT } from "@afterhive/ui";
import { Alert, Box, Button, Stack, TextField, Typography } from "@mui/material";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";

type CreateTenantFormProps = {
  onCreated?: (result: { slug: string; stripeCustomerId: string }) => void;
};

export function CreateTenantForm({ onCreated }: CreateTenantFormProps) {
  const t = useT();
  const router = useRouter();
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [legalName, setLegalName] = useState("");
  const [ownerEmail, setOwnerEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  function mapCreateTenantError(code?: string) {
    switch (code) {
      case "invalid_slug":
        return t("platform.tenants.create.error.invalidSlug");
      case "slug_taken":
        return t("platform.tenants.create.error.slugTaken");
      case "owner_invite_failed":
        return t("platform.tenants.create.error.ownerInviteFailed");
      case "forbidden":
        return t("platform.tenants.create.error.forbidden");
      default:
        return t("platform.tenants.create.error.default");
    }
  }

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setSuccess(null);
    setLoading(true);

    const response = await fetch("/platform/api/tenants", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name,
        slug,
        legalName: legalName || undefined,
        ownerEmail,
      }),
    });

    if (!response.ok) {
      const payload = (await response.json()) as { error?: string };
      setError(mapCreateTenantError(payload.error));
      setLoading(false);
      return;
    }

    const result = (await response.json()) as {
      slug: string;
      stripeCustomerId: string;
    };

    setSuccess(
      t("platform.tenants.create.success", {
        slug: result.slug,
        stripeCustomerId: result.stripeCustomerId,
      }),
    );
    setName("");
    setSlug("");
    setLegalName("");
    setOwnerEmail("");
    setLoading(false);
    onCreated?.(result);
    router.push("/tenants");
    router.refresh();
  }

  return (
    <Box component="form" onSubmit={onSubmit} sx={{ maxWidth: 560 }}>
      <Stack spacing={2}>
        <Typography variant="body2" color="text.secondary">
          {t("platform.tenants.create.description")}
        </Typography>
        {error ? <Alert severity="error">{error}</Alert> : null}
        {success ? <Alert severity="success">{success}</Alert> : null}
        <TextField
          label={t("platform.tenants.create.name.label")}
          required
          fullWidth
          value={name}
          onChange={(event) => setName(event.target.value)}
        />
        <TextField
          label={t("platform.tenants.create.slug.label")}
          required
          fullWidth
          helperText={t("platform.tenants.create.slug.helper")}
          value={slug}
          onChange={(event) => setSlug(event.target.value)}
        />
        <TextField
          label={t("platform.tenants.create.legalName.label")}
          fullWidth
          value={legalName}
          onChange={(event) => setLegalName(event.target.value)}
        />
        <TextField
          label={t("platform.tenants.create.ownerEmail.label")}
          type="email"
          required
          fullWidth
          value={ownerEmail}
          onChange={(event) => setOwnerEmail(event.target.value)}
        />
        <Button type="submit" variant="contained" disabled={loading}>
          {t("platform.tenants.create.submit")}
        </Button>
      </Stack>
    </Box>
  );
}
