"use client";

import { useT } from "@afterhive/ui";
import { Alert, Button, MenuItem, Stack, TextField } from "@mui/material";
import { useRouter } from "next/navigation";
import { type FormEvent, useState } from "react";

type LocationOption = {
  id: string;
  name: string;
};

type CreateOfferFormProps = {
  tenantSlug: string;
  locations: LocationOption[];
};

export function CreateOfferForm({ tenantSlug, locations }: CreateOfferFormProps) {
  const t = useT();
  const router = useRouter();
  const [name, setName] = useState("");
  const [groupName, setGroupName] = useState("");
  const [locationId, setLocationId] = useState(locations[0]?.id ?? "");
  const [capacity, setCapacity] = useState("20");
  const [weekday, setWeekday] = useState("MO");
  const [startTime, setStartTime] = useState("17:00");
  const [durationMinutes, setDurationMinutes] = useState("90");
  const [generateWeeks, setGenerateWeeks] = useState("8");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  function mapCreateOfferError(code?: string) {
    switch (code) {
      case "missing_fields":
        return t("admin.offers.create.error.missingFields");
      case "invalid_location":
        return t("admin.offers.create.error.invalidLocation");
      case "location_forbidden":
      case "forbidden":
        return t("admin.offers.create.error.forbidden");
      case "invalid_recurrence":
      case "session_generation_failed":
        return t("admin.offers.create.error.invalidRecurrence");
      default:
        return t("admin.offers.create.error.default");
    }
  }

  function buildDtstartIso() {
    const now = new Date();
    const year = now.getUTCFullYear();
    const month = String(now.getUTCMonth() + 1).padStart(2, "0");
    const day = String(now.getUTCDate()).padStart(2, "0");
    return `${year}-${month}-${day}T${startTime}:00.000Z`;
  }

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setSuccess(null);
    setLoading(true);

    try {
      const response = await fetch("/app/api/offers", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-tenant-slug": tenantSlug,
        },
        body: JSON.stringify({
          name,
          type: "course",
          locationId,
          groupName,
          capacity: Number(capacity),
          recurrence: {
            dtstart: buildDtstartIso(),
            durationMinutes: Number(durationMinutes),
            rrule: `FREQ=WEEKLY;BYDAY=${weekday}`,
            timezone: "Europe/Berlin",
            generateWeeks: Number(generateWeeks),
          },
        }),
      });

      if (!response.ok) {
        let payload: { error?: string } = {};
        try {
          payload = (await response.json()) as { error?: string };
        } catch {
          payload = {};
        }
        setError(mapCreateOfferError(payload.error));
        setLoading(false);
        return;
      }

      const payload = (await response.json()) as { sessionCount?: number };
      setSuccess(
        t("admin.offers.create.success", {
          sessions: payload.sessionCount ?? 0,
        }),
      );
      setName("");
      setGroupName("");
      setLoading(false);
      router.refresh();
    } catch {
      setError(mapCreateOfferError());
      setLoading(false);
    }
  }

  if (locations.length === 0) {
    return <Alert severity="warning">{t("admin.offers.create.noLocations")}</Alert>;
  }

  return (
    <Stack component="form" onSubmit={onSubmit} spacing={2} sx={{ maxWidth: 560 }}>
      {error ? <Alert severity="error">{error}</Alert> : null}
      {success ? <Alert severity="success">{success}</Alert> : null}
      <TextField
        label={t("admin.offers.create.name.label")}
        required
        fullWidth
        value={name}
        onChange={(event) => setName(event.target.value)}
      />
      <TextField
        label={t("admin.offers.create.groupName.label")}
        required
        fullWidth
        value={groupName}
        onChange={(event) => setGroupName(event.target.value)}
      />
      <TextField
        select
        label={t("admin.offers.create.location.label")}
        required
        fullWidth
        value={locationId}
        onChange={(event) => setLocationId(event.target.value)}
      >
        {locations.map((location) => (
          <MenuItem key={location.id} value={location.id}>
            {location.name}
          </MenuItem>
        ))}
      </TextField>
      <TextField
        label={t("admin.offers.create.capacity.label")}
        required
        fullWidth
        type="number"
        slotProps={{ htmlInput: { min: 1 } }}
        value={capacity}
        onChange={(event) => setCapacity(event.target.value)}
      />
      <TextField
        select
        label={t("admin.offers.create.weekday.label")}
        required
        fullWidth
        value={weekday}
        onChange={(event) => setWeekday(event.target.value)}
      >
        <MenuItem value="MO">{t("admin.offers.create.weekday.monday")}</MenuItem>
        <MenuItem value="TU">{t("admin.offers.create.weekday.tuesday")}</MenuItem>
        <MenuItem value="WE">{t("admin.offers.create.weekday.wednesday")}</MenuItem>
        <MenuItem value="TH">{t("admin.offers.create.weekday.thursday")}</MenuItem>
        <MenuItem value="FR">{t("admin.offers.create.weekday.friday")}</MenuItem>
      </TextField>
      <TextField
        label={t("admin.offers.create.startTime.label")}
        required
        fullWidth
        type="time"
        value={startTime}
        onChange={(event) => setStartTime(event.target.value)}
        slotProps={{ htmlInput: { step: 300 } }}
      />
      <TextField
        label={t("admin.offers.create.durationMinutes.label")}
        required
        fullWidth
        type="number"
        slotProps={{ htmlInput: { min: 1 } }}
        value={durationMinutes}
        onChange={(event) => setDurationMinutes(event.target.value)}
      />
      <TextField
        label={t("admin.offers.create.generateWeeks.label")}
        required
        fullWidth
        type="number"
        slotProps={{ htmlInput: { min: 1, max: 52 } }}
        value={generateWeeks}
        onChange={(event) => setGenerateWeeks(event.target.value)}
      />
      <Button type="submit" variant="contained" disabled={loading}>
        {loading ? t("admin.offers.create.submitting") : t("admin.offers.create.submit")}
      </Button>
    </Stack>
  );
}
