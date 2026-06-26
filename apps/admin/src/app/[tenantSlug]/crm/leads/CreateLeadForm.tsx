"use client";

import { useT } from "@afterhive/ui";
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
  const t = useT();
  const router = useRouter();
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [locationId, setLocationId] = useState(locations[0]?.id ?? "");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  function mapCreateLeadError(code?: string) {
    switch (code) {
      case "missing_fields":
      case "empty":
        return t("admin.leads.create.error.missingFields");
      case "too_long":
        return t("admin.leads.create.error.tooLong");
      case "invalid_location":
        return t("admin.leads.create.error.invalidLocation");
      case "location_forbidden":
      case "forbidden":
        return t("admin.leads.create.error.forbidden");
      default:
        return t("admin.leads.create.error.default");
    }
  }

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setLoading(true);

    try {
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
        let payload: { error?: string } = {};
        try {
          payload = (await response.json()) as { error?: string };
        } catch {
          payload = {};
        }
        setError(mapCreateLeadError(payload.error));
        setLoading(false);
        return;
      }

      setFirstName("");
      setLastName("");
      setLoading(false);
      router.refresh();
    } catch {
      setError(mapCreateLeadError());
      setLoading(false);
    }
  }

  if (locations.length === 0) {
    return null;
  }

  return (
    <Box component="form" onSubmit={onSubmit} sx={{ maxWidth: 520 }}>
      <Stack spacing={2}>
        {error ? <Alert severity="error">{error}</Alert> : null}
        <TextField
          label={t("admin.leads.create.firstName.label")}
          required
          fullWidth
          value={firstName}
          onChange={(event) => setFirstName(event.target.value)}
        />
        <TextField
          label={t("admin.leads.create.lastName.label")}
          required
          fullWidth
          value={lastName}
          onChange={(event) => setLastName(event.target.value)}
        />
        <FormControl fullWidth required>
          <InputLabel id="create-lead-location-label">
            {t("admin.leads.create.location.label")}
          </InputLabel>
          <Select
            labelId="create-lead-location-label"
            label={t("admin.leads.create.location.label")}
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
          {t("admin.leads.create.submit")}
        </Button>
      </Stack>
    </Box>
  );
}
