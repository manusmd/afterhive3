import { getAdminSessionContext } from "@afterhive/api/auth/get-admin-session";
import { canReadRoster } from "@afterhive/api/club/can-read-roster";
import { canUpdateRoster } from "@afterhive/api/club/can-update-roster";
import {
  getTeamRoster,
  listRosterMemberOptions,
} from "@afterhive/api/club/list-roster";
import { createTranslator, DEFAULT_LOCALE, getMessages } from "@afterhive/shared/i18n";
import { SurfaceShell } from "@afterhive/ui";
import { Stack, Typography } from "@mui/material";
import Link from "next/link";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { SettingsForbidden } from "@/components/SettingsForbidden";
import { StaffLogoutButton } from "@/components/StaffLogoutButton";
import { UpdateRosterForm } from "./UpdateRosterForm";

const t = createTranslator(getMessages(DEFAULT_LOCALE));

type TeamRosterPageProps = {
  params: Promise<{ tenantSlug: string; teamId: string }>;
};

export default async function TeamRosterPage({ params }: TeamRosterPageProps) {
  const { tenantSlug, teamId } = await params;
  const session = await getAdminSessionContext(tenantSlug, await headers());

  if (!session) {
    redirect(`/${tenantSlug}/login`);
  }

  const pageTitle = t("admin.club.roster.title");

  if (!canReadRoster(session.roles, session.locationIds, session.roleAssignments)) {
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

  const roster = await getTeamRoster(session, tenantSlug, teamId);

  if (!roster) {
    redirect(`/${tenantSlug}/club/teams`);
  }

  const canEdit = canUpdateRoster(session.roles, session.locationIds, session.roleAssignments);
  const memberOptions = canEdit ? await listRosterMemberOptions(session, tenantSlug) : [];
  const activeEntries = roster.entries
    .filter((entry) => entry.status === "active")
    .map((entry) => ({
      memberProfileId: entry.memberProfileId,
      memberLabel: entry.memberLabel,
      jerseyNumber: entry.jerseyNumber ?? "",
    }));

  return (
    <SurfaceShell surface="admin" title={pageTitle}>
      <Stack spacing={2}>
        <Stack direction="row" sx={{ justifyContent: "flex-end" }}>
          <StaffLogoutButton tenantSlug={tenantSlug} />
        </Stack>
        <Typography variant="body2" color="text.secondary">
          <Link href={`/${tenantSlug}/club/teams`}>{t("admin.club.roster.back")}</Link>
        </Typography>
        <Typography variant="h6">
          {roster.teamName} · {roster.departmentName}
        </Typography>
        <UpdateRosterForm
          tenantSlug={tenantSlug}
          teamId={teamId}
          initialEntries={activeEntries}
          memberOptions={memberOptions}
          canEdit={canEdit}
        />
      </Stack>
    </SurfaceShell>
  );
}
