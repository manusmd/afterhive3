"use client";

import { useT } from "@afterhive/ui";
import { Alert, Box, Button, Stack, TextField, Typography } from "@mui/material";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";

type AcceptInviteFormProps = {
  tenantSlug: string;
  token: string;
  email: string;
};

export function AcceptInviteForm({ tenantSlug, token, email }: AcceptInviteFormProps) {
  const t = useT();
  const router = useRouter();
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  function mapAcceptError(code?: string) {
    switch (code) {
      case "invalid_invite":
        return t("admin.invite.accept.error.invalidInvite");
      case "already_member":
        return t("admin.invite.accept.error.alreadyMember");
      default:
        return t("admin.invite.accept.error.default");
    }
  }

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
          {t("admin.invite.accept.forEmail", { email })}
        </Typography>
        {error ? <Alert severity="error">{error}</Alert> : null}
        <TextField
          label={t("admin.invite.accept.name.label")}
          required
          fullWidth
          value={name}
          onChange={(event) => setName(event.target.value)}
        />
        <TextField
          label={t("admin.invite.accept.password.label")}
          type="password"
          autoComplete="new-password"
          required
          fullWidth
          value={password}
          onChange={(event) => setPassword(event.target.value)}
        />
        <Button type="submit" variant="contained" disabled={loading}>
          {t("admin.invite.accept.submit")}
        </Button>
      </Stack>
    </Box>
  );
}
