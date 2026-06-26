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
} from "@mui/material";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";

type LocationOption = {
  id: string;
  name: string;
};

type CreateLeadFormProps = {
  tenantSlug: string;
  locations: LocationOption[];
};

export function CreateLeadForm({ tenantSlug, locations }: CreateLeadFormProps) {
  const router = useRouter();
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [locationId, setLocationId] = useState(locations[0]?.id ?? "");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setLoading(true);

    const response = await fetch("/app/api/leads", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-tenant-slug": tenantSlug,
      },
      body: JSON.stringify({
        firstName,
        lastName,
        locationId,
      }),
    });

    if (!response.ok) {
      const payload = (await response.json()) as { error?: string };
      setError(mapCreateLeadError(payload.error));
      setLoading(false);
      return;
    }

    setFirstName("");
    setLastName("");
    setLoading(false);
    router.refresh();
  }

  if (locations.length === 0) {
    return null;
  }

  return (
    <Box component="form" onSubmit={onSubmit} sx={{ maxWidth: 520 }}>
      <Stack spacing={2}>
        {error ? <Alert severity="error">{error}</Alert> : null}
        <TextField
          label="Vorname"
          required
          fullWidth
          value={firstName}
          onChange={(event) => setFirstName(event.target.value)}
        />
        <TextField
          label="Nachname"
          required
          fullWidth
          value={lastName}
          onChange={(event) => setLastName(event.target.value)}
        />
        <FormControl fullWidth required>
          <InputLabel id="create-lead-location-label">Standort</InputLabel>
          <Select
            labelId="create-lead-location-label"
            label="Standort"
            value={locationId}
            onChange={(event) => setLocationId(event.target.value)}
          >
            {locations.map((location) => (
              <MenuItem key={location.id} value={location.id}>
                {location.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        <Button type="submit" variant="contained" disabled={loading}>
          Lead anlegen
        </Button>
      </Stack>
    </Box>
  );
}

function mapCreateLeadError(code?: string) {
  switch (code) {
    case "missing_fields":
    case "empty":
      return "Vorname, Nachname und Standort sind erforderlich.";
    case "too_long":
      return "Name ist zu lang (max. 255 Zeichen).";
    case "invalid_location":
      return "Standort ist ungueltig.";
    case "location_forbidden":
    case "forbidden":
      return "Keine Berechtigung fuer diesen Standort.";
    default:
      return "Lead konnte nicht angelegt werden.";
  }
}
