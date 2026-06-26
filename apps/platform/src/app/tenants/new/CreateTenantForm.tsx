"use client";

import { Alert, Box, Button, Stack, TextField, Typography } from "@mui/material";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";

type CreateTenantFormProps = {
  onCreated?: (result: { slug: string; stripeCustomerId: string }) => void;
};

export function CreateTenantForm({ onCreated }: CreateTenantFormProps) {
  const router = useRouter();
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [legalName, setLegalName] = useState("");
  const [ownerEmail, setOwnerEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

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
      `Tenant ${result.slug} erstellt. Owner-Einladung versendet. Stripe: ${result.stripeCustomerId}`,
    );
    setName("");
    setSlug("");
    setLegalName("");
    setOwnerEmail("");
    setLoading(false);
    onCreated?.(result);
    router.refresh();
  }

  return (
    <Box component="form" onSubmit={onSubmit} sx={{ maxWidth: 560 }}>
      <Stack spacing={2}>
        <Typography variant="body2" color="text.secondary">
          Erstellt Tenant, Stripe-Kunde (Stub) und Owner-Einladung.
        </Typography>
        {error ? <Alert severity="error">{error}</Alert> : null}
        {success ? <Alert severity="success">{success}</Alert> : null}
        <TextField
          label="Name"
          required
          fullWidth
          value={name}
          onChange={(event) => setName(event.target.value)}
        />
        <TextField
          label="Slug"
          required
          fullWidth
          helperText="Kleinbuchstaben, Zahlen und Bindestriche"
          value={slug}
          onChange={(event) => setSlug(event.target.value)}
        />
        <TextField
          label="Rechtlicher Name"
          fullWidth
          value={legalName}
          onChange={(event) => setLegalName(event.target.value)}
        />
        <TextField
          label="Owner E-Mail"
          type="email"
          required
          fullWidth
          value={ownerEmail}
          onChange={(event) => setOwnerEmail(event.target.value)}
        />
        <Button type="submit" variant="contained" disabled={loading}>
          Tenant anlegen
        </Button>
      </Stack>
    </Box>
  );
}

function mapCreateTenantError(code?: string) {
  switch (code) {
    case "invalid_slug":
      return "Slug ungueltig (3–48 Zeichen, a-z, 0-9, Bindestriche).";
    case "slug_taken":
      return "Dieser Slug ist bereits vergeben.";
    case "owner_invite_failed":
      return "Owner-Einladung fehlgeschlagen.";
    case "forbidden":
      return "Keine Berechtigung.";
    default:
      return "Tenant konnte nicht erstellt werden.";
  }
}
