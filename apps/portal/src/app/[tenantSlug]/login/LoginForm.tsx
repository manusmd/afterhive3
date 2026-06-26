"use client";

import { useT } from "@afterhive/ui";
import { Alert, Box, Button, Stack, TextField, Typography } from "@mui/material";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { authClient } from "@/lib/auth-client";

type LoginFormProps = {
  tenantSlug: string;
};

export function LoginForm({ tenantSlug }: LoginFormProps) {
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

    const result = await authClient.signIn.email({
      email,
      password,
      fetchOptions: {
        headers: {
          "x-tenant-slug": tenantSlug,
        },
      },
    });

    if (result.error) {
      setError(t("portal.login.error.invalidCredentials"));
      setLoading(false);
      return;
    }

    const sessionResponse = await fetch("/portal/api/session", {
      headers: {
        "x-tenant-slug": tenantSlug,
      },
    });

    if (!sessionResponse.ok) {
      await authClient.signOut();
      setError(t("portal.login.error.noPortalAccess"));
      setLoading(false);
      return;
    }

    router.push(`/${tenantSlug}/consent`);
    router.refresh();
  }

  return (
    <Box component="form" onSubmit={onSubmit} sx={{ maxWidth: 420 }}>
      <Stack spacing={2}>
        <Typography variant="body2" color="text.secondary">
          {t("portal.login.tenantLabel", { tenantSlug })}
        </Typography>
        {error ? <Alert severity="error">{error}</Alert> : null}
        <TextField
          label={t("portal.login.email.label")}
          type="email"
          autoComplete="email"
          required
          fullWidth
          value={email}
          onChange={(event) => setEmail(event.target.value)}
        />
        <TextField
          label={t("portal.login.password.label")}
          type="password"
          autoComplete="current-password"
          required
          fullWidth
          value={password}
          onChange={(event) => setPassword(event.target.value)}
        />
        <Button type="submit" variant="contained" disabled={loading}>
          {t("portal.login.submit")}
        </Button>
      </Stack>
    </Box>
  );
}
