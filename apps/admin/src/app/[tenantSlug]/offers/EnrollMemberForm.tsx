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
} from "@mui/material";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";

type EnrollOption = {
  id: string;
  label: string;
};

type EnrollMemberFormProps = {
  tenantSlug: string;
  offerGroups: EnrollOption[];
  members: EnrollOption[];
};

export function EnrollMemberForm({ tenantSlug, offerGroups, members }: EnrollMemberFormProps) {
  const t = useT();
  const router = useRouter();
  const [memberProfileId, setMemberProfileId] = useState(members[0]?.id ?? "");
  const [offerGroupId, setOfferGroupId] = useState(offerGroups[0]?.id ?? "");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  function mapEnrollError(code?: string) {
    switch (code) {
      case "missing_fields":
        return t("admin.enrollment.enroll.error.missingFields");
      case "member_not_found":
        return t("admin.enrollment.enroll.error.memberNotFound");
      case "offer_group_not_found":
        return t("admin.enrollment.enroll.error.offerGroupNotFound");
      case "location_forbidden":
      case "forbidden":
        return t("admin.enrollment.enroll.error.forbidden");
      case "group_closed":
        return t("admin.enrollment.enroll.error.groupClosed");
      case "group_full":
        return t("admin.enrollment.enroll.error.groupFull");
      case "already_enrolled":
        return t("admin.enrollment.enroll.error.alreadyEnrolled");
      case "already_waitlisted":
        return t("admin.enrollment.enroll.error.alreadyWaitlisted");
      default:
        return t("admin.enrollment.enroll.error.default");
    }
  }

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setSuccess(null);
    setLoading(true);

    try {
      const response = await fetch("/app/api/enrollments", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-tenant-slug": tenantSlug,
        },
        body: JSON.stringify({
          memberProfileId,
          offerGroupId,
        }),
      });

      if (!response.ok) {
        let payload: { error?: string } = {};
        try {
          payload = (await response.json()) as { error?: string };
        } catch {
          payload = {};
        }
        setError(mapEnrollError(payload.error));
        setLoading(false);
        return;
      }

      const payload = (await response.json()) as
        | { outcome: "enrolled"; enrollmentId: string; status: "active" | "pending" }
        | { outcome: "waitlisted"; waitlistEntryId: string; position: number; status: "waiting" };

      setSuccess(
        payload.outcome === "enrolled"
          ? payload.status === "active"
            ? t("admin.enrollment.enroll.success.active")
            : t("admin.enrollment.enroll.success.pending")
          : t("admin.enrollment.enroll.success.waitlisted", { position: payload.position }),
      );
      setLoading(false);
      router.refresh();
    } catch {
      setError(mapEnrollError());
      setLoading(false);
    }
  }

  if (offerGroups.length === 0 && members.length === 0) {
    return (
      <Alert severity="info">{t("admin.enrollment.enroll.empty.noMembersOrGroups")}</Alert>
    );
  }

  if (offerGroups.length === 0) {
    return <Alert severity="info">{t("admin.enrollment.enroll.empty.noOfferGroups")}</Alert>;
  }

  if (members.length === 0) {
    return <Alert severity="info">{t("admin.enrollment.enroll.empty.noMembers")}</Alert>;
  }

  return (
    <Box component="form" onSubmit={onSubmit} sx={{ maxWidth: 520 }}>
      <Stack spacing={2}>
        {error ? <Alert severity="error">{error}</Alert> : null}
        {success ? <Alert severity="success">{success}</Alert> : null}
        <FormControl fullWidth required>
          <InputLabel id="enroll-member-label">{t("admin.enrollment.enroll.member.label")}</InputLabel>
          <Select
            labelId="enroll-member-label"
            label={t("admin.enrollment.enroll.member.label")}
            value={memberProfileId}
            onChange={(event) => setMemberProfileId(event.target.value)}
          >
            {members.map((member) => (
              <MenuItem key={member.id} value={member.id}>
                {member.label}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        <FormControl fullWidth required>
          <InputLabel id="enroll-offer-group-label">
            {t("admin.enrollment.enroll.offerGroup.label")}
          </InputLabel>
          <Select
            labelId="enroll-offer-group-label"
            label={t("admin.enrollment.enroll.offerGroup.label")}
            value={offerGroupId}
            onChange={(event) => setOfferGroupId(event.target.value)}
          >
            {offerGroups.map((group) => (
              <MenuItem key={group.id} value={group.id}>
                {group.label}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        <Button type="submit" variant="contained" disabled={loading}>
          {t("admin.enrollment.enroll.submit")}
        </Button>
      </Stack>
    </Box>
  );
}
