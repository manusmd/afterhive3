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
  Typography,
} from "@mui/material";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";

type SessionOption = {
  id: string;
  label: string;
  assignedStaff: string[];
};

type StaffOption = {
  id: string;
  label: string;
};

type AssignSessionStaffFormProps = {
  tenantSlug: string;
  sessions: SessionOption[];
  staff: StaffOption[];
};

export function AssignSessionStaffForm({
  tenantSlug,
  sessions,
  staff,
}: AssignSessionStaffFormProps) {
  const t = useT();
  const router = useRouter();
  const [sessionId, setSessionId] = useState(sessions[0]?.id ?? "");
  const [userId, setUserId] = useState(staff[0]?.id ?? "");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const selectedSession = sessions.find((entry) => entry.id === sessionId);

  function mapAssignStaffError(code?: string) {
    switch (code) {
      case "missing_fields":
        return t("admin.schedule.assignStaff.error.missingFields");
      case "session_not_found":
        return t("admin.schedule.assignStaff.error.sessionNotFound");
      case "staff_not_found":
        return t("admin.schedule.assignStaff.error.staffNotFound");
      case "location_forbidden":
      case "forbidden":
        return t("admin.schedule.assignStaff.error.forbidden");
      case "already_assigned":
        return t("admin.schedule.assignStaff.error.alreadyAssigned");
      case "staff_double_book":
        return t("admin.schedule.assignStaff.error.staffDoubleBook");
      default:
        return t("admin.schedule.assignStaff.error.default");
    }
  }

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setSuccess(null);
    setLoading(true);

    try {
      const response = await fetch(`/app/api/sessions/${sessionId}/staff`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-tenant-slug": tenantSlug,
        },
        body: JSON.stringify({ userId, role: "lead" }),
      });

      if (!response.ok) {
        let payload: { error?: string } = {};
        try {
          payload = (await response.json()) as { error?: string };
        } catch {
          payload = {};
        }
        setError(mapAssignStaffError(payload.error));
        setLoading(false);
        return;
      }

      setSuccess(t("admin.schedule.assignStaff.success"));
      setLoading(false);
      router.refresh();
    } catch {
      setError(mapAssignStaffError());
      setLoading(false);
    }
  }

  if (sessions.length === 0 && staff.length === 0) {
    return (
      <Alert severity="info">{t("admin.schedule.assignStaff.empty.noSessionsOrStaff")}</Alert>
    );
  }

  if (sessions.length === 0) {
    return <Alert severity="info">{t("admin.schedule.assignStaff.empty.noSessions")}</Alert>;
  }

  if (staff.length === 0) {
    return <Alert severity="info">{t("admin.schedule.assignStaff.empty.noStaff")}</Alert>;
  }

  return (
    <Box component="form" onSubmit={onSubmit} sx={{ maxWidth: 520 }}>
      <Stack spacing={2}>
        {error ? <Alert severity="error">{error}</Alert> : null}
        {success ? <Alert severity="success">{success}</Alert> : null}
        <FormControl fullWidth required>
          <InputLabel id="assign-staff-session-label">
            {t("admin.schedule.assignStaff.session.label")}
          </InputLabel>
          <Select
            labelId="assign-staff-session-label"
            label={t("admin.schedule.assignStaff.session.label")}
            value={sessionId}
            onChange={(event) => setSessionId(event.target.value)}
          >
            {sessions.map((session) => (
              <MenuItem key={session.id} value={session.id}>
                {session.label}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        {selectedSession && selectedSession.assignedStaff.length > 0 ? (
          <Typography variant="body2" color="text.secondary">
            {t("admin.schedule.assignStaff.assigned", {
              names: selectedSession.assignedStaff.join(", "),
            })}
          </Typography>
        ) : null}
        <FormControl fullWidth required>
          <InputLabel id="assign-staff-user-label">
            {t("admin.schedule.assignStaff.staff.label")}
          </InputLabel>
          <Select
            labelId="assign-staff-user-label"
            label={t("admin.schedule.assignStaff.staff.label")}
            value={userId}
            onChange={(event) => setUserId(event.target.value)}
          >
            {staff.map((member) => (
              <MenuItem key={member.id} value={member.id}>
                {member.label}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        <Button type="submit" variant="contained" disabled={loading}>
          {t("admin.schedule.assignStaff.submit")}
        </Button>
      </Stack>
    </Box>
  );
}
