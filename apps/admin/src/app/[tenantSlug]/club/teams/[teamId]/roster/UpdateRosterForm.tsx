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
  Typography,
} from "@mui/material";
import { useRouter } from "next/navigation";
import { FormEvent, useMemo, useState } from "react";

type RosterEntryDraft = {
  memberProfileId: string;
  memberLabel: string;
  jerseyNumber: string;
};

type MemberOption = {
  memberProfileId: string;
  label: string;
};

type UpdateRosterFormProps = {
  tenantSlug: string;
  teamId: string;
  initialEntries: RosterEntryDraft[];
  memberOptions: MemberOption[];
  canEdit: boolean;
};

export function UpdateRosterForm({
  tenantSlug,
  teamId,
  initialEntries,
  memberOptions,
  canEdit,
}: UpdateRosterFormProps) {
  const t = useT();
  const router = useRouter();
  const [entries, setEntries] = useState<RosterEntryDraft[]>(
    initialEntries.filter((entry) => entry.memberProfileId),
  );
  const [selectedMemberId, setSelectedMemberId] = useState(memberOptions[0]?.memberProfileId ?? "");
  const [jerseyNumber, setJerseyNumber] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const availableMembers = useMemo(
    () =>
      memberOptions.filter(
        (option) => !entries.some((entry) => entry.memberProfileId === option.memberProfileId),
      ),
    [entries, memberOptions],
  );

  function mapUpdateError(code?: string) {
    switch (code) {
      case "missing_fields":
        return t("admin.club.roster.error.missingFields");
      case "team_not_found":
        return t("admin.club.roster.error.teamNotFound");
      case "member_not_found":
        return t("admin.club.roster.error.memberNotFound");
      case "duplicate_member":
        return t("admin.club.roster.error.duplicateMember");
      case "location_forbidden":
      case "forbidden":
        return t("admin.club.roster.error.forbidden");
      default:
        return t("admin.club.roster.error.default");
    }
  }

  function addEntry() {
    const member = availableMembers.find((option) => option.memberProfileId === selectedMemberId);
    if (!member) {
      return;
    }

    setEntries((current) => [
      ...current,
      {
        memberProfileId: member.memberProfileId,
        memberLabel: member.label,
        jerseyNumber: jerseyNumber.trim(),
      },
    ]);
    setJerseyNumber("");
    setSelectedMemberId(
      availableMembers.find((option) => option.memberProfileId !== member.memberProfileId)
        ?.memberProfileId ?? "",
    );
  }

  function removeEntry(memberProfileId: string) {
    setEntries((current) => current.filter((entry) => entry.memberProfileId !== memberProfileId));
  }

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setSuccess(null);
    setLoading(true);

    try {
      const response = await fetch(`/app/api/club/teams/${teamId}/roster`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-tenant-slug": tenantSlug,
        },
        body: JSON.stringify({
          entries: entries.map((entry) => ({
            memberProfileId: entry.memberProfileId,
            jerseyNumber: entry.jerseyNumber.trim() || null,
          })),
        }),
      });

      if (!response.ok) {
        let payload: { error?: string } = {};
        try {
          payload = (await response.json()) as { error?: string };
        } catch {
          payload = {};
        }
        setError(mapUpdateError(payload.error));
        setLoading(false);
        return;
      }

      setSuccess(t("admin.club.roster.success"));
      setLoading(false);
      router.refresh();
    } catch {
      setError(mapUpdateError());
      setLoading(false);
    }
  }

  if (!canEdit) {
    return entries.length === 0 ? (
      <Alert severity="info">{t("admin.club.roster.empty")}</Alert>
    ) : (
      <Stack spacing={1}>
        {entries.map((entry) => (
          <Typography key={entry.memberProfileId}>
            {entry.memberLabel}
            {entry.jerseyNumber ? ` · #${entry.jerseyNumber}` : ""}
          </Typography>
        ))}
      </Stack>
    );
  }

  return (
    <Box component="form" onSubmit={onSubmit} sx={{ maxWidth: 640 }}>
      <Stack spacing={2}>
        {error ? <Alert severity="error">{error}</Alert> : null}
        {success ? <Alert severity="success">{success}</Alert> : null}
        {entries.length === 0 ? (
          <Alert severity="info">{t("admin.club.roster.empty")}</Alert>
        ) : (
          <Stack spacing={1}>
            {entries.map((entry) => (
              <Stack
                key={entry.memberProfileId}
                direction="row"
                spacing={1}
                sx={{ alignItems: "center" }}
              >
                <Typography sx={{ flex: 1 }}>
                  {entry.memberLabel}
                  {entry.jerseyNumber ? ` · #${entry.jerseyNumber}` : ""}
                </Typography>
                <Button size="small" onClick={() => removeEntry(entry.memberProfileId)}>
                  {t("admin.club.roster.remove")}
                </Button>
              </Stack>
            ))}
          </Stack>
        )}
        {availableMembers.length > 0 ? (
          <Stack direction={{ xs: "column", sm: "row" }} spacing={1}>
            <FormControl fullWidth>
              <InputLabel id="roster-member-label">{t("admin.club.roster.member.label")}</InputLabel>
              <Select
                labelId="roster-member-label"
                label={t("admin.club.roster.member.label")}
                value={selectedMemberId}
                onChange={(event) => setSelectedMemberId(event.target.value)}
              >
                {availableMembers.map((member) => (
                  <MenuItem key={member.memberProfileId} value={member.memberProfileId}>
                    {member.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <TextField
              label={t("admin.club.roster.jersey.label")}
              value={jerseyNumber}
              onChange={(event) => setJerseyNumber(event.target.value)}
              sx={{ minWidth: 120 }}
            />
            <Button variant="outlined" onClick={addEntry} disabled={!selectedMemberId}>
              {t("admin.club.roster.add")}
            </Button>
          </Stack>
        ) : memberOptions.length === 0 ? (
          <Alert severity="info">{t("admin.club.roster.noMembers")}</Alert>
        ) : null}
        <Button type="submit" variant="contained" disabled={loading}>
          {t("admin.club.roster.submit")}
        </Button>
      </Stack>
    </Box>
  );
}
