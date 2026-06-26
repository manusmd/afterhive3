"use client";

import { useT } from "@afterhive/ui";
import { Alert, Box, Button, Stack, TextField } from "@mui/material";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { authClient } from "@/lib/auth-client";

export function PlatformLoginForm() {
  const t = useT();
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
      setError(t("platform.login.error.invalidCredentials"));
      setLoading(false);
      return;
    }

    const sessionResponse = await fetch("/platform/api/session");

    if (sessionResponse.status === 403) {
      await authClient.signOut();
      setError(t("platform.login.error.noPlatformAccess"));
      setLoading(false);
      return;
    }

    if (!sessionResponse.ok) {
      await authClient.signOut();
      setError(t("platform.login.error.default"));
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
          label={t("platform.login.email.label")}
          type="email"
          autoComplete="email"
          required
          fullWidth
          value={email}
          onChange={(event) => setEmail(event.target.value)}
        />
        <TextField
          label={t("platform.login.password.label")}
          type="password"
          autoComplete="current-password"
          required
          fullWidth
          value={password}
          onChange={(event) => setPassword(event.target.value)}
        />
        <Button type="submit" variant="contained" disabled={loading}>
          {t("platform.login.submit")}
        </Button>
      </Stack>
    </Box>
  );
}
