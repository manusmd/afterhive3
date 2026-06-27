import { getAdminSessionContext } from "@afterhive/api/auth/get-admin-session";
import { listAttendanceSessions } from "@afterhive/api/attendance/list-session-attendance";
import { canReadSessions } from "@afterhive/api/attendance/can-read-sessions";
import { createTranslator, DEFAULT_LOCALE, getMessages } from "@afterhive/shared/i18n";
import { Panel } from "@afterhive/ui";
import { Button, Divider, Stack, Typography } from "@mui/material";
import Link from "next/link";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { AdminPageFrame } from "@/components/AdminPageFrame";
import { SettingsForbidden } from "@/components/SettingsForbidden";

const t = createTranslator(getMessages(DEFAULT_LOCALE));

type SessionsPageProps = {
  params: Promise<{ tenantSlug: string }>;
};

export default async function SessionsPage({ params }: SessionsPageProps) {
  const { tenantSlug } = await params;
  const session = await getAdminSessionContext(tenantSlug, await headers());

  if (!session) {
    redirect(`/${tenantSlug}/login`);
  }

  const pageTitle = t("admin.attendance.sessions.title");

  if (!canReadSessions(session.roles, session.locationIds)) {
    return (
      <AdminPageFrame title={pageTitle}>
        <SettingsForbidden tenantSlug={tenantSlug} />
      </AdminPageFrame>
    );
  }

  const sessions = await listAttendanceSessions(session, tenantSlug);

  return (
    <AdminPageFrame title={pageTitle}>
      <Panel>
        {sessions.length === 0 ? (
          <Typography color="text.secondary">{t("admin.attendance.sessions.empty")}</Typography>
        ) : (
          <Stack divider={<Divider flexItem />} spacing={1.5}>
            {sessions.map((item) => (
              <Stack key={item.sessionId} direction="row" spacing={1} sx={{ alignItems: "center" }}>
                <Typography sx={{ flex: 1 }}>{item.label}</Typography>
                <Link href={`/${tenantSlug}/sessions/${item.sessionId}`}>
                  <Button variant="outlined" size="small">
                    {t("admin.attendance.sessions.open")}
                  </Button>
                </Link>
              </Stack>
            ))}
          </Stack>
        )}
      </Panel>
    </AdminPageFrame>
  );
}
