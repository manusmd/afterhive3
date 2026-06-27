import { getAdminSessionContext } from "@afterhive/api/auth/get-admin-session";
import { canAccessClubSport } from "@afterhive/api/club/can-access-club-sport";
import { listTeams } from "@afterhive/api/club/list-roster";
import { createTranslator, DEFAULT_LOCALE, getMessages } from "@afterhive/shared/i18n";
import { Panel } from "@afterhive/ui";
import { Button, Divider, Stack, Typography } from "@mui/material";
import Link from "next/link";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { AdminPageFrame } from "@/components/AdminPageFrame";
import { SettingsForbidden } from "@/components/SettingsForbidden";

const t = createTranslator(getMessages(DEFAULT_LOCALE));

type TeamsPageProps = {
  params: Promise<{ tenantSlug: string }>;
};

export default async function TeamsPage({ params }: TeamsPageProps) {
  const { tenantSlug } = await params;
  const session = await getAdminSessionContext(tenantSlug, await headers());

  if (!session) {
    redirect(`/${tenantSlug}/login`);
  }

  const pageTitle = t("admin.club.teams.title");

  if (!(await canAccessClubSport(session))) {
    return (
      <AdminPageFrame title={pageTitle}>
        <SettingsForbidden tenantSlug={tenantSlug} />
      </AdminPageFrame>
    );
  }

  const teams = await listTeams(session, tenantSlug);

  return (
    <AdminPageFrame title={pageTitle}>
      <Panel>
        {teams.length === 0 ? (
          <Typography color="text.secondary">{t("admin.club.teams.empty")}</Typography>
        ) : (
          <Stack divider={<Divider flexItem />} spacing={1.5}>
            {teams.map((team) => (
              <Stack key={team.teamId} direction="row" spacing={1} sx={{ alignItems: "center" }}>
                <Typography sx={{ flex: 1 }}>
                  {team.teamName} · {team.departmentName}
                </Typography>
                <Link href={`/${tenantSlug}/club/teams/${team.teamId}/roster`}>
                  <Button variant="outlined" size="small">
                    {t("admin.club.teams.openRoster")}
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
