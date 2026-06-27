import { canAssignRoles } from "@afterhive/api/auth/can-assign-roles";
import { canAccessClubSport } from "@afterhive/api/club/can-access-club-sport";
import { canUploadDocument } from "@afterhive/api/document/can-upload-document";
import { canReadSessions } from "@afterhive/api/attendance/can-read-sessions";
import { canReadOffers } from "@afterhive/api/offer/can-read-offers";
import { canRunImport } from "@afterhive/api/crm/can-run-import";
import { canReadLeads } from "@afterhive/api/crm/can-read-leads";
import { canReadPersons } from "@afterhive/api/crm/can-read-persons";
import { canViewLocations } from "@afterhive/api/location/can-manage-locations";
import type { SessionContext } from "@afterhive/domain";
import type { AdminNavSection } from "@afterhive/ui";
import type { createTranslator } from "@afterhive/shared/i18n";

type BuildAdminNavOptions = {
  tenantSlug: string;
  session: SessionContext;
  showClub: boolean;
  t: ReturnType<typeof createTranslator>;
};

export function buildAdminNav({
  tenantSlug,
  session,
  showClub,
  t,
}: BuildAdminNavOptions): AdminNavSection[] {
  const base = `/${tenantSlug}`;
  const sections: AdminNavSection[] = [];

  sections.push({
    title: t("admin.shell.sections.overview"),
    items: [{ label: t("admin.nav.dashboard"), href: `${base}/` }],
  });

  const crmItems: AdminNavSection["items"] = [];

  if (canReadLeads(session.roles, session.locationIds)) {
    crmItems.push({ label: t("admin.nav.leads"), href: `${base}/crm/leads` });
  }

  if (canReadPersons(session.roles, session.locationIds)) {
    crmItems.push({ label: t("admin.nav.persons"), href: `${base}/crm/persons` });
  }

  if (canRunImport(session.roles, session.locationIds, session.roleAssignments)) {
    crmItems.push({ label: t("admin.nav.import"), href: `${base}/crm/import` });
  }

  if (canUploadDocument(session.roles)) {
    crmItems.push({ label: t("admin.nav.documents"), href: `${base}/crm/documents` });
  }

  if (crmItems.length > 0) {
    sections.push({
      title: t("admin.shell.sections.crm"),
      items: crmItems,
    });
  }

  const offerItems: AdminNavSection["items"] = [];

  if (canReadOffers(session.roles, session.locationIds)) {
    offerItems.push({ label: t("admin.nav.offers"), href: `${base}/offers` });
  }

  if (canReadSessions(session.roles, session.locationIds)) {
    offerItems.push({ label: t("admin.nav.sessions"), href: `${base}/sessions` });
  }

  if (offerItems.length > 0) {
    sections.push({
      title: t("admin.shell.sections.offers"),
      items: offerItems,
    });
  }

  if (showClub) {
    sections.push({
      title: t("admin.shell.sections.club"),
      items: [{ label: t("admin.nav.teams"), href: `${base}/club/teams` }],
    });
  }

  const settingsItems: AdminNavSection["items"] = [];

  if (canViewLocations(session.roles)) {
    settingsItems.push({
      label: t("admin.nav.locations"),
      href: `${base}/settings/locations`,
    });
  }

  if (canAssignRoles(session.roles)) {
    settingsItems.push({ label: t("admin.nav.team"), href: `${base}/settings/team` });
  }

  if (settingsItems.length > 0) {
    sections.push({
      title: t("admin.shell.sections.settings"),
      items: settingsItems,
    });
  }

  return sections;
}

export async function resolveAdminClubNavVisible(session: SessionContext) {
  return canAccessClubSport(session);
}
