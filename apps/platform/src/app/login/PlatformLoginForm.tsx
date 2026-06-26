"use client";

import { Alert, Box, Button, Stack, TextField, Typography } from "@mui/material";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { authClient } from "@/lib/auth-client";

export function PlatformLoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setLoading(true);

    const result = await authClient.signIn.email({ email, password });

    if (result.error) {
      setError("Anmeldung fehlgeschlagen. E-Mail oder Passwort ungueltig.");
      setLoading(false);
      return;
    }

    const sessionResponse = await fetch("/platform/api/session");

    if (sessionResponse.status === 403) {
      await authClient.signOut();
      setError(
        "Dieses Konto hat keinen Plattform-Zugang. Tenant-Accounts melden sich im Admin-Portal an.",
      );
      setLoading(false);
      return;
    }

    if (!sessionResponse.ok) {
      await authClient.signOut();
      setError("Anmeldung fehlgeschlagen. Bitte erneut versuchen.");
      setLoading(false);
      return;
    }

    router.push("/tenants");
    router.refresh();
  }

  return (
    <Box component="form" onSubmit={onSubmit} sx={{ maxWidth: 420 }}>
      <Stack spacing={2}>
        {error ? <Alert severity="error">{error}</Alert> : null}
        <TextField
          label="E-Mail"
          type="email"
          autoComplete="email"
          required
          fullWidth
          value={email}
          onChange={(event) => setEmail(event.target.value)}
        />
        <TextField
          label="Passwort"
          type="password"
          autoComplete="current-password"
          required
          fullWidth
          value={password}
          onChange={(event) => setPassword(event.target.value)}
        />
        <Button type="submit" variant="contained" disabled={loading}>
          Anmelden
        </Button>
      </Stack>
    </Box>
  );
}
