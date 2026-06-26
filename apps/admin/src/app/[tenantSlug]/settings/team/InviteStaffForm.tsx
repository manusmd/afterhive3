"use client";

import {
  Alert,
  Box,
  Button,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";

type LocationOption = {
  id: string;
  name: string;
};

type InviteStaffFormProps = {
  tenantSlug: string;
  locations: LocationOption[];
};

const STAFF_ROLES = [
  { value: "tenant_admin", label: "Administrator" },
  { value: "tenant_office", label: "Buero" },
  { value: "tenant_coach", label: "Trainer" },
  { value: "tenant_finance", label: "Finanzen" },
  { value: "tenant_location_manager", label: "Standortleitung" },
];

export function InviteStaffForm({ tenantSlug, locations }: InviteStaffFormProps) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("tenant_office");
  const [locationIds, setLocationIds] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setSuccess(null);
    setLoading(true);

    const response = await fetch("/app/api/staff/invite", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-tenant-slug": tenantSlug,
      },
      body: JSON.stringify({
        email,
        role,
        locationIds: locationIds.length ? locationIds : undefined,
      }),
    });

    if (!response.ok) {
      const payload = (await response.json()) as { error?: string };
      setError(mapInviteError(payload.error));
      setLoading(false);
      return;
    }

    setEmail("");
    setLocationIds([]);
    setSuccess("Einladung versendet.");
    setLoading(false);
    router.refresh();
  }

  return (
    <Box component="form" onSubmit={onSubmit} sx={{ maxWidth: 520 }}>
      <Stack spacing={2}>
        <Typography variant="h6">Mitarbeiter einladen</Typography>
        {error ? <Alert severity="error">{error}</Alert> : null}
        {success ? <Alert severity="success">{success}</Alert> : null}
        <TextField
          label="E-Mail"
          type="email"
          required
          fullWidth
          value={email}
          onChange={(event) => setEmail(event.target.value)}
        />
        <FormControl fullWidth>
          <InputLabel id="invite-role-label">Rolle</InputLabel>
          <Select
            labelId="invite-role-label"
            label="Rolle"
            value={role}
            onChange={(event) => setRole(event.target.value)}
          >
            {STAFF_ROLES.map((entry) => (
              <MenuItem key={entry.value} value={entry.value}>
                {entry.label}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        {locations.length ? (
          <FormControl fullWidth>
            <InputLabel id="invite-locations-label">Standorte</InputLabel>
            <Select
              labelId="invite-locations-label"
              label="Standorte"
              multiple
              value={locationIds}
              onChange={(event) => setLocationIds(event.target.value as string[])}
              renderValue={(selected) =>
                selected
                  .map((id) => locations.find((location) => location.id === id)?.name ?? id)
                  .join(", ")
              }
            >
              {locations.map((location) => (
                <MenuItem key={location.id} value={location.id}>
                  {location.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        ) : null}
        <Button type="submit" variant="contained" disabled={loading}>
          Einladung senden
        </Button>
      </Stack>
    </Box>
  );
}

function mapInviteError(code?: string) {
  switch (code) {
    case "already_member":
      return "Diese Person ist bereits Mitglied.";
    case "invite_pending":
      return "Es gibt bereits eine offene Einladung.";
    case "forbidden":
      return "Keine Berechtigung.";
    default:
      return "Einladung fehlgeschlagen.";
  }
}
