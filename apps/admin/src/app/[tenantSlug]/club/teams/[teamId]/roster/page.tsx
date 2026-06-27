import { getAdminSessionContext } from "@afterhive/api/auth/get-admin-session";
import {
  canAccessClubSport,
  canManageClubRoster,
} from "@afterhive/api/club/can-access-club-sport";
import {
  getTeamRoster,
  listRosterMemberOptions,
} from "@afterhive/api/club/list-roster";
import { createTranslator, DEFAULT_LOCALE, getMessages } from "@afterhive/shared/i18n";
import { Panel } from "@afterhive/ui";
import { Stack } from "@mui/material";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { AdminPageFrame } from "@/components/AdminPageFrame";
import { SettingsForbidden } from "@/components/SettingsForbidden";
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

  if (!(await canAccessClubSport(session))) {
    return (
      <AdminPageFrame title={pageTitle}>
        <SettingsForbidden tenantSlug={tenantSlug} />
      </AdminPageFrame>
    );
  }

  const roster = await getTeamRoster(session, tenantSlug, teamId);

  if (!roster) {
    redirect(`/${tenantSlug}/club/teams`);
  }

  const canEdit = await canManageClubRoster(session);
  const memberOptions = canEdit ? await listRosterMemberOptions(session, tenantSlug) : [];
  const activeEntries = roster.entries
    .filter((entry) => entry.status === "active")
    .map((entry) => ({
      memberProfileId: entry.memberProfileId,
      memberLabel: entry.memberLabel,
      jerseyNumber: entry.jerseyNumber ?? "",
    }));

  return (
    <AdminPageFrame
      title={pageTitle}
      subtitle={`${roster.teamName} · ${roster.departmentName}`}
    >
      <Panel>
        <UpdateRosterForm
          tenantSlug={tenantSlug}
          teamId={teamId}
          initialEntries={activeEntries}
          memberOptions={memberOptions}
          canEdit={canEdit}
        />
      </Panel>
    </AdminPageFrame>
  );
}
