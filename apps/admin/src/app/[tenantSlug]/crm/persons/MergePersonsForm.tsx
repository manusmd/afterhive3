"use client";

import { useT } from "@afterhive/ui";
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  Typography,
} from "@mui/material";
import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

type PersonOption = {
  id: string;
  firstName: string;
  lastName: string;
};

type MergePersonsFormProps = {
  tenantSlug: string;
  persons: PersonOption[];
};

export function MergePersonsForm({ tenantSlug, persons }: MergePersonsFormProps) {
  const t = useT();
  const router = useRouter();
  const [winnerId, setWinnerId] = useState("");
  const [loserId, setLoserId] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  function mapMergeError(code?: string) {
    switch (code) {
      case "same_person":
        return t("admin.persons.merge.error.samePerson");
      case "person_not_found":
        return t("admin.persons.merge.error.personNotFound");
      case "already_deleted":
        return t("admin.persons.merge.error.alreadyDeleted");
      case "forbidden":
        return t("admin.persons.merge.error.forbidden");
      default:
        return t("admin.persons.merge.error.default");
    }
  }

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setSuccess(null);

    if (!winnerId || !loserId) {
      setError(t("admin.persons.merge.error.missingSelection"));
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("/app/api/crm/persons/merge", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-tenant-slug": tenantSlug,
        },
        body: JSON.stringify({ winnerId, loserId }),
      });

      if (!response.ok) {
        let payload: { error?: string } = {};
        try {
          payload = (await response.json()) as { error?: string };
        } catch {
          payload = {};
        }
        setError(mapMergeError(payload.error));
        setLoading(false);
        return;
      }

      const result = (await response.json()) as { repointedLeadIds: string[] };
      setSuccess(
        t("admin.persons.merge.success", { count: result.repointedLeadIds.length }),
      );
      setWinnerId("");
      setLoserId("");
      setLoading(false);
      router.refresh();
    } catch {
      setError(mapMergeError());
      setLoading(false);
    }
  }

  if (persons.length < 2) {
    return null;
  }

  return (
    <Box component="form" onSubmit={onSubmit} sx={{ maxWidth: 720 }}>
      <Stack spacing={2}>
        <Typography variant="h6">{t("admin.persons.merge.title")}</Typography>
        {error ? <Alert severity="error">{error}</Alert> : null}
        {success ? <Alert severity="success">{success}</Alert> : null}
        <FormControl fullWidth required>
          <InputLabel id="merge-winner-person">{t("admin.persons.merge.winner.label")}</InputLabel>
          <Select
            labelId="merge-winner-person"
            label={t("admin.persons.merge.winner.label")}
            value={winnerId}
            onChange={(event) => setWinnerId(event.target.value)}
          >
            {persons.map((person) => (
              <MenuItem key={person.id} value={person.id}>
                {person.firstName} {person.lastName}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        <FormControl fullWidth required>
          <InputLabel id="merge-loser-person">{t("admin.persons.merge.loser.label")}</InputLabel>
          <Select
            labelId="merge-loser-person"
            label={t("admin.persons.merge.loser.label")}
            value={loserId}
            onChange={(event) => setLoserId(event.target.value)}
          >
            {persons.map((person) => (
              <MenuItem key={person.id} value={person.id}>
                {person.firstName} {person.lastName}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        <Button
          type="submit"
          variant="contained"
          disabled={loading || !winnerId || !loserId}
          startIcon={loading ? <CircularProgress color="inherit" size={16} /> : undefined}
        >
          {loading ? t("admin.persons.merge.submitting") : t("admin.persons.merge.submit")}
        </Button>
      </Stack>
    </Box>
  );
}
