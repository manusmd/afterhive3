import { getAdminSessionContext } from "@afterhive/api/auth/get-admin-session";
import { listAttendanceSessions } from "@afterhive/api/attendance/list-session-attendance";
import { canReadOffers } from "@afterhive/api/offer/can-read-offers";
import { createTranslator, DEFAULT_LOCALE, getMessages } from "@afterhive/shared/i18n";
import { SurfaceShell } from "@afterhive/ui";
import { Button, Stack, Typography } from "@mui/material";
import Link from "next/link";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { SettingsForbidden } from "@/components/SettingsForbidden";
import { StaffLogoutButton } from "@/components/StaffLogoutButton";

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

  const sessions = await listAttendanceSessions(session, tenantSlug);

  return (
    <SurfaceShell surface="admin" title={pageTitle}>
      <Stack spacing={2}>
        <Stack direction="row" sx={{ justifyContent: "flex-end" }}>
          <StaffLogoutButton tenantSlug={tenantSlug} />
        </Stack>
        <Typography variant="body2" color="text.secondary">
          <Link href={`/${tenantSlug}`}>{t("admin.attendance.sessions.back")}</Link>
        </Typography>
        {sessions.length === 0 ? (
          <Typography color="text.secondary">{t("admin.attendance.sessions.empty")}</Typography>
        ) : (
          <Stack spacing={1}>
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
      </Stack>
    </SurfaceShell>
  );
}
