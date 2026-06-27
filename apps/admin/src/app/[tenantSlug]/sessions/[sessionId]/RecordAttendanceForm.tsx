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

type AttendanceStatus = "present" | "absent" | "excused" | "late";

type AttendanceMember = {
  memberProfileId: string;
  memberLabel: string;
  status: AttendanceStatus | null;
};

type RecordAttendanceFormProps = {
  tenantSlug: string;
  sessionId: string;
  members: AttendanceMember[];
  canEdit: boolean;
};

const STATUS_OPTIONS: AttendanceStatus[] = ["present", "absent", "excused", "late"];

export function RecordAttendanceForm({
  tenantSlug,
  sessionId,
  members,
  canEdit,
}: RecordAttendanceFormProps) {
  const t = useT();
  const router = useRouter();
  const [entries, setEntries] = useState(
    members.map((member) => ({
      memberProfileId: member.memberProfileId,
      memberLabel: member.memberLabel,
      status: member.status ?? ("present" as AttendanceStatus),
    })),
  );
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  function mapError(code?: string) {
    switch (code) {
      case "missing_fields":
        return t("admin.attendance.session.error.missingFields");
      case "session_not_found":
        return t("admin.attendance.session.error.sessionNotFound");
      case "member_not_eligible":
        return t("admin.attendance.session.error.memberNotEligible");
      case "invalid_status":
        return t("admin.attendance.session.error.invalidStatus");
      case "forbidden":
        return t("admin.attendance.session.error.forbidden");
      default:
        return t("admin.attendance.session.error.default");
    }
  }

  function statusLabel(status: AttendanceStatus | null) {
    switch (status) {
      case "present":
        return t("admin.attendance.session.status.present");
      case "absent":
        return t("admin.attendance.session.status.absent");
      case "excused":
        return t("admin.attendance.session.status.excused");
      case "late":
        return t("admin.attendance.session.status.late");
      default:
        return t("admin.attendance.session.status.unset");
    }
  }

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setSuccess(null);
    setLoading(true);

    try {
      const response = await fetch(`/app/api/sessions/${sessionId}/attendance`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-tenant-slug": tenantSlug,
        },
        body: JSON.stringify({
          records: entries.map((entry) => ({
            memberProfileId: entry.memberProfileId,
            status: entry.status,
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
        setError(mapError(payload.error));
        setLoading(false);
        return;
      }

      setSuccess(t("admin.attendance.session.success"));
      setLoading(false);
      router.refresh();
    } catch {
      setError(mapError());
      setLoading(false);
    }
  }

  if (members.length === 0) {
    return <Alert severity="info">{t("admin.attendance.session.emptyMembers")}</Alert>;
  }

  if (!canEdit) {
    return (
      <Stack spacing={1}>
        {members.map((member) => (
          <Typography key={member.memberProfileId}>
            {member.memberLabel} · {statusLabel(member.status)}
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
        {entries.map((entry, index) => (
          <Stack key={entry.memberProfileId} direction="row" spacing={1} sx={{ alignItems: "center" }}>
            <Typography sx={{ flex: 1 }}>{entry.memberLabel}</Typography>
            <FormControl sx={{ minWidth: 180 }}>
              <InputLabel id={`attendance-status-${entry.memberProfileId}`}>
                {t("admin.attendance.session.status.label")}
              </InputLabel>
              <Select
                labelId={`attendance-status-${entry.memberProfileId}`}
                label={t("admin.attendance.session.status.label")}
                value={entry.status}
                onChange={(event) => {
                  const status = event.target.value as AttendanceStatus;
                  setEntries((current) =>
                    current.map((item, itemIndex) =>
                      itemIndex === index ? { ...item, status } : item,
                    ),
                  );
                }}
              >
                {STATUS_OPTIONS.map((status) => (
                  <MenuItem key={status} value={status}>
                    {statusLabel(status)}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Stack>
        ))}
        <Button type="submit" variant="contained" disabled={loading}>
          {t("admin.attendance.session.submit")}
        </Button>
      </Stack>
    </Box>
  );
}
