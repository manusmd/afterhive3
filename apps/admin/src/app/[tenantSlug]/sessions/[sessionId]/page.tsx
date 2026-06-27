import { getAdminSessionContext } from "@afterhive/api/auth/get-admin-session";
import { getSessionAttendance } from "@afterhive/api/attendance/list-session-attendance";
import { canReadOffers } from "@afterhive/api/offer/can-read-offers";
import { createTranslator, DEFAULT_LOCALE, getMessages } from "@afterhive/shared/i18n";
import { SurfaceShell } from "@afterhive/ui";
import { Stack, Typography } from "@mui/material";
import Link from "next/link";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { SettingsForbidden } from "@/components/SettingsForbidden";
import { StaffLogoutButton } from "@/components/StaffLogoutButton";
import { RecordAttendanceForm } from "./RecordAttendanceForm";

const t = createTranslator(getMessages(DEFAULT_LOCALE));

type SessionAttendancePageProps = {
  params: Promise<{ tenantSlug: string; sessionId: string }>;
};

export default async function SessionAttendancePage({ params }: SessionAttendancePageProps) {
  const { tenantSlug, sessionId } = await params;
  const session = await getAdminSessionContext(tenantSlug, await headers());

  if (!session) {
    redirect(`/${tenantSlug}/login`);
  }

  const pageTitle = t("admin.attendance.session.title");

  if (!canReadOffers(session.roles, session.locationIds)) {
    return (
      <SurfaceShell surface="admin" title={pageTitle}>
        <Stack spacing={2}>
          <Stack direction="row" sx={{ justifyContent: "flex-end" }}>
            <StaffLogoutButton tenantSlug={tenantSlug} />
          </Stack>
          <SettingsForbidden tenantSlug={tenantSlug} title={pageTitle} />
        </Stack>
      </SurfaceShell>
    );
  }

  const attendance = await getSessionAttendance(session, tenantSlug, sessionId);

  if (!attendance) {
    redirect(`/${tenantSlug}/sessions`);
  }

  return (
    <SurfaceShell surface="admin" title={pageTitle}>
      <Stack spacing={2}>
        <Stack direction="row" sx={{ justifyContent: "flex-end" }}>
          <StaffLogoutButton tenantSlug={tenantSlug} />
        </Stack>
        <Typography variant="body2" color="text.secondary">
          <Link href={`/${tenantSlug}/sessions`}>{t("admin.attendance.session.back")}</Link>
        </Typography>
        <Typography variant="h6">{attendance.sessionLabel}</Typography>
        <Typography variant="body2" color="text.secondary">
          {t("admin.attendance.session.startsAt", { value: attendance.startsAt })}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {t("admin.attendance.session.endsAt", { value: attendance.endsAt })}
        </Typography>
        <RecordAttendanceForm
          tenantSlug={tenantSlug}
          sessionId={sessionId}
          members={attendance.members}
          canEdit={attendance.canRecord}
        />
      </Stack>
    </SurfaceShell>
  );
}
