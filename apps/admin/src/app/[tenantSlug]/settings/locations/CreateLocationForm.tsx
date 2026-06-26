"use client";

import { Alert, Box, Button, Stack, TextField } from "@mui/material";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";

type CreateLocationFormProps = {
  tenantSlug: string;
};

export function CreateLocationForm({ tenantSlug }: CreateLocationFormProps) {
  const router = useRouter();
  const [name, setName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setLoading(true);

    const response = await fetch("/app/api/locations", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-tenant-slug": tenantSlug,
      },
      body: JSON.stringify({ name }),
    });

    if (!response.ok) {
      const payload = (await response.json()) as { error?: string };
      setError(mapCreateLocationError(payload.error));
      setLoading(false);
      return;
    }

    setName("");
    setLoading(false);
    router.refresh();
  }

  return (
    <Box component="form" onSubmit={onSubmit} sx={{ maxWidth: 420 }}>
      <Stack spacing={2}>
        {error ? <Alert severity="error">{error}</Alert> : null}
        <TextField
          label="Standortname"
          required
          fullWidth
          value={name}
          onChange={(event) => setName(event.target.value)}
        />
        <Button type="submit" variant="contained" disabled={loading}>
          Standort anlegen
        </Button>
      </Stack>
    </Box>
  );
}

function mapCreateLocationError(code?: string) {
  switch (code) {
    case "empty":
      return "Name darf nicht leer sein.";
    case "too_long":
      return "Name ist zu lang (max. 255 Zeichen).";
    case "forbidden":
      return "Keine Berechtigung.";
    default:
      return "Standort konnte nicht angelegt werden.";
  }
}
