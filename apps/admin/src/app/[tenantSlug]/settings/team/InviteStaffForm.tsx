"use client";

import { requiresAssignedLocations } from "@afterhive/api/location/role-location-scope";
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
  { value: "tenant_admin", labelKey: "admin.team.roles.administrator" },
  { value: "tenant_office", labelKey: "admin.team.roles.office" },
  { value: "tenant_coach", labelKey: "admin.team.roles.coach" },
  { value: "tenant_finance", labelKey: "admin.team.roles.finance" },
  { value: "tenant_location_manager", labelKey: "admin.team.roles.locationManager" },
] as const;

export function InviteStaffForm({ tenantSlug, locations }: InviteStaffFormProps) {
  const t = useT();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("tenant_office");
  const [locationIds, setLocationIds] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  function mapInviteError(code?: string) {
    switch (code) {
      case "already_member":
        return t("admin.team.invite.error.alreadyMember");
      case "invite_pending":
        return t("admin.team.invite.error.invitePending");
      case "forbidden":
        return t("admin.team.invite.error.forbidden");
      case "locations_required":
        return t("admin.team.invite.error.locationsRequired");
      default:
        return t("admin.team.invite.error.default");
    }
  }

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setSuccess(null);

    if (requiresAssignedLocations(role) && locationIds.length === 0) {
      setError(t("admin.team.invite.error.locationsRequired"));
      return;
    }

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
        locationIds: requiresAssignedLocations(role)
          ? locationIds
          : locationIds.length
            ? locationIds
            : undefined,
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
    setSuccess(t("admin.team.invite.success"));
    setLoading(false);
    router.refresh();
  }

  return (
    <Box component="form" onSubmit={onSubmit} sx={{ maxWidth: 520 }}>
      <Stack spacing={2}>
        <Typography variant="h6">{t("admin.team.invite.title")}</Typography>
        {error ? <Alert severity="error">{error}</Alert> : null}
        {success ? <Alert severity="success">{success}</Alert> : null}
        <TextField
          label={t("admin.team.invite.email.label")}
          type="email"
          required
          fullWidth
          value={email}
          onChange={(event) => setEmail(event.target.value)}
        />
        <FormControl fullWidth>
          <InputLabel id="invite-role-label">{t("admin.team.invite.role.label")}</InputLabel>
          <Select
            labelId="invite-role-label"
            label={t("admin.team.invite.role.label")}
            value={role}
            onChange={(event) => setRole(event.target.value)}
          >
            {STAFF_ROLES.map((entry) => (
              <MenuItem key={entry.value} value={entry.value}>
                {t(entry.labelKey)}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        {locations.length ? (
          <FormControl fullWidth required={requiresAssignedLocations(role)}>
            <InputLabel id="invite-locations-label">
              {t("admin.team.invite.locations.label")}
            </InputLabel>
            <Select
              labelId="invite-locations-label"
              label={t("admin.team.invite.locations.label")}
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
          {t("admin.team.invite.submit")}
        </Button>
      </Stack>
    </Box>
  );
}
