"use client";

import { useT } from "@afterhive/ui";
import { Alert, Button } from "@mui/material";
import { useRouter } from "next/navigation";
import { useState } from "react";

type EndEnrollmentButtonProps = {
  tenantSlug: string;
  enrollmentId: string;
};

export function EndEnrollmentButton({ tenantSlug, enrollmentId }: EndEnrollmentButtonProps) {
  const t = useT();
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  function mapEndEnrollmentError(code?: string) {
    switch (code) {
      case "invalid_status":
        return t("admin.enrollment.end.error.invalidStatus");
      case "location_forbidden":
      case "forbidden":
        return t("admin.enrollment.end.error.forbidden");
      case "enrollment_not_found":
        return t("admin.enrollment.end.error.notFound");
      default:
        return t("admin.enrollment.end.error.default");
    }
  }

  async function onEnd() {
    setError(null);
    setLoading(true);

    try {
      const response = await fetch(`/app/api/enrollments/${enrollmentId}/end`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-tenant-slug": tenantSlug,
        },
        body: JSON.stringify({ reason: "completed" }),
      });

      if (!response.ok) {
        let payload: { error?: string } = {};
        try {
          payload = (await response.json()) as { error?: string };
        } catch {
          payload = {};
        }
        setError(mapEndEnrollmentError(payload.error));
        setLoading(false);
        return;
      }

      setLoading(false);
      router.refresh();
    } catch {
      setError(mapEndEnrollmentError());
      setLoading(false);
    }
  }

  return (
    <>
      {error ? (
        <Alert severity="error" sx={{ mb: 1 }}>
          {error}
        </Alert>
      ) : null}
      <Button size="small" variant="outlined" color="warning" disabled={loading} onClick={onEnd}>
        {t("admin.enrollment.end.button")}
      </Button>
    </>
  );
}
