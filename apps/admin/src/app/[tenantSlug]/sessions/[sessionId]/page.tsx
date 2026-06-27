import { getAdminSessionContext } from "@afterhive/api/auth/get-admin-session";
import { getSessionAttendance } from "@afterhive/api/attendance/list-session-attendance";
import { canReadSessions } from "@afterhive/api/attendance/can-read-sessions";
import { createTranslator, DEFAULT_LOCALE, getMessages } from "@afterhive/shared/i18n";
import { Panel } from "@afterhive/ui";
import { Stack, Typography } from "@mui/material";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { AdminPageFrame } from "@/components/AdminPageFrame";
import { SettingsForbidden } from "@/components/SettingsForbidden";
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

  if (!canReadSessions(session.roles, session.locationIds)) {
    return (
      <AdminPageFrame title={pageTitle}>
        <SettingsForbidden tenantSlug={tenantSlug} />
      </AdminPageFrame>
    );
  }

  const attendance = await getSessionAttendance(session, tenantSlug, sessionId);

  if (!attendance) {
    redirect(`/${tenantSlug}/sessions`);
  }

  return (
    <AdminPageFrame title={pageTitle} subtitle={attendance.sessionLabel}>
      <Stack spacing={2}>
        <Panel>
          <Stack spacing={1} sx={{ mb: 2 }}>
            <Typography variant="body2" color="text.secondary">
              {t("admin.attendance.session.startsAt", { value: attendance.startsAt })}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {t("admin.attendance.session.endsAt", { value: attendance.endsAt })}
            </Typography>
          </Stack>
          <RecordAttendanceForm
            tenantSlug={tenantSlug}
            sessionId={sessionId}
            members={attendance.members}
            canEdit={attendance.canRecord}
          />
        </Panel>
      </Stack>
    </AdminPageFrame>
  );
}
