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

type LeadStatusActionsProps = {
  tenantSlug: string;
  leadId: string;
  allowedTransitions: string[];
};

export function LeadStatusActions({
  tenantSlug,
  leadId,
  allowedTransitions,
}: LeadStatusActionsProps) {
  const t = useT();
  const router = useRouter();
  const [nextStatus, setNextStatus] = useState(allowedTransitions[0] ?? "");
  const [lostReason, setLostReason] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  if (allowedTransitions.length === 0) {
    return null;
  }

  function mapUpdateLeadStatusError(code?: string) {
    switch (code) {
      case "invalid_transition":
        return t("admin.leads.pipeline.error.invalidTransition");
      case "missing_lost_reason":
        return t("admin.leads.pipeline.error.missingLostReason");
      case "reopen_forbidden":
      case "forbidden":
      case "location_forbidden":
        return t("admin.leads.pipeline.error.forbidden");
      case "lead_not_found":
        return t("admin.leads.pipeline.error.notFound");
      default:
        return t("admin.leads.pipeline.error.default");
    }
  }

  function statusLabel(status: string) {
    return t(`admin.leads.pipeline.actions.${status}`);
  }

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const response = await fetch(`/app/api/leads/${leadId}/status`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "x-tenant-slug": tenantSlug,
        },
        body: JSON.stringify({
          status: nextStatus,
          lostReason: nextStatus === "lost" ? lostReason : undefined,
        }),
      });

      if (!response.ok) {
        let payload: { error?: string } = {};
        try {
          payload = (await response.json()) as { error?: string };
        } catch {
          payload = {};
        }
        setError(mapUpdateLeadStatusError(payload.error));
        setLoading(false);
        return;
      }

      setLostReason("");
      setLoading(false);
      router.refresh();
    } catch {
      setError(mapUpdateLeadStatusError());
      setLoading(false);
    }
  }

  return (
    <Box component="form" onSubmit={onSubmit} sx={{ minWidth: 220 }}>
      <Stack spacing={1}>
        {error ? <Alert severity="error">{error}</Alert> : null}
        <FormControl size="small" fullWidth>
          <InputLabel id={`lead-status-${leadId}`}>
            {t("admin.leads.pipeline.nextStatus.label")}
          </InputLabel>
          <Select
            labelId={`lead-status-${leadId}`}
            label={t("admin.leads.pipeline.nextStatus.label")}
            value={nextStatus}
            onChange={(event) => setNextStatus(event.target.value)}
          >
            {allowedTransitions.map((status) => (
              <MenuItem key={status} value={status}>
                {statusLabel(status)}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        {nextStatus === "lost" ? (
          <TextField
            size="small"
            fullWidth
            required
            label={t("admin.leads.pipeline.lostReason.label")}
            value={lostReason}
            onChange={(event) => setLostReason(event.target.value)}
          />
        ) : null}
        <Button type="submit" size="small" variant="outlined" disabled={loading || !nextStatus}>
          {t("admin.leads.pipeline.submit")}
        </Button>
      </Stack>
    </Box>
  );
}
