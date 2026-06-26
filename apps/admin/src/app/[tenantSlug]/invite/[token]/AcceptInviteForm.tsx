"use client";

import { Alert, Box, Button, Stack, TextField, Typography } from "@mui/material";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";

type AcceptInviteFormProps = {
  tenantSlug: string;
  token: string;
  email: string;
};

export function AcceptInviteForm({ tenantSlug, token, email }: AcceptInviteFormProps) {
  const router = useRouter();
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setLoading(true);

    const response = await fetch("/app/api/staff/accept", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-tenant-slug": tenantSlug,
      },
      body: JSON.stringify({
        token,
        name,
        password,
      }),
    });

    if (!response.ok) {
      const payload = (await response.json()) as { error?: string };
      setError(mapAcceptError(payload.error));
      setLoading(false);
      return;
    }

    router.push(`/${tenantSlug}/login`);
    router.refresh();
  }

  return (
    <Box component="form" onSubmit={onSubmit} sx={{ maxWidth: 420 }}>
      <Stack spacing={2}>
        <Typography variant="body2" color="text.secondary">
          Einladung fuer {email}
        </Typography>
        {error ? <Alert severity="error">{error}</Alert> : null}
        <TextField
          label="Name"
          required
          fullWidth
          value={name}
          onChange={(event) => setName(event.target.value)}
        />
        <TextField
          label="Passwort"
          type="password"
          autoComplete="new-password"
          required
          fullWidth
          value={password}
          onChange={(event) => setPassword(event.target.value)}
        />
        <Button type="submit" variant="contained" disabled={loading}>
          Konto aktivieren
        </Button>
      </Stack>
    </Box>
  );
}

function mapAcceptError(code?: string) {
  switch (code) {
    case "invalid_invite":
      return "Einladung ungueltig oder abgelaufen.";
    case "already_member":
      return "Konto ist bereits aktiv.";
    default:
      return "Aktivierung fehlgeschlagen.";
  }
}
