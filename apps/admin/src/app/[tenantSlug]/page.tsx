import { canAssignRoles } from "@afterhive/api/auth/can-assign-roles";
import { getAdminSessionContext } from "@afterhive/api/auth/get-admin-session";
import { canUploadDocument } from "@afterhive/api/document/can-upload-document";
import { canReadOffers } from "@afterhive/api/offer/can-read-offers";
import { canRunImport } from "@afterhive/api/crm/can-run-import";
import { canReadLeads } from "@afterhive/api/crm/can-read-leads";
import { canReadPersons } from "@afterhive/api/crm/can-read-persons";
import { canViewLocations } from "@afterhive/api/location/can-manage-locations";
import { createTranslator, DEFAULT_LOCALE, getMessages } from "@afterhive/shared/i18n";
import { SurfaceShell } from "@afterhive/ui";
import { Button, Chip, Stack, Typography } from "@mui/material";
import Link from "next/link";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { StaffLogoutButton } from "@/components/StaffLogoutButton";

const t = createTranslator(getMessages(DEFAULT_LOCALE));

type TenantDashboardProps = {
  params: Promise<{ tenantSlug: string }>;
};

export default async function TenantDashboardPage({ params }: TenantDashboardProps) {
  const { tenantSlug } = await params;
  const session = await getAdminSessionContext(tenantSlug, await headers());

  if (!session) {
    redirect(`/${tenantSlug}/login`);
  }

  const showLocations = canViewLocations(session.roles);
  const showTeam = canAssignRoles(session.roles);
  const showLeads = canReadLeads(session.roles, session.locationIds);
  const showPersons = canReadPersons(session.roles, session.locationIds);
  const showImport = canRunImport(session.roles, session.locationIds, session.roleAssignments);
  const showDocuments = canUploadDocument(session.roles);
  const showOffers = canReadOffers(session.roles, session.locationIds);

  return (
    <SurfaceShell surface="admin" title={t("admin.dashboard.title")}>
      <Stack spacing={2}>
        <Stack direction="row" sx={{ justifyContent: "flex-end" }}>
          <StaffLogoutButton tenantSlug={tenantSlug} />
        </Stack>
        <Typography color="text.secondary">
          {t("admin.dashboard.signedInAs", {
            userId: session.userId,
            tenantSlug: session.tenantSlug ?? tenantSlug,
          })}
        </Typography>
        {showLeads || showPersons || showImport || showDocuments || showOffers || showLocations || showTeam ? (
          <Stack direction="row" spacing={1} sx={{ flexWrap: "wrap" }} useFlexGap>
            {showLeads ? (
              <Link href={`/${tenantSlug}/crm/leads`}>
                <Button variant="outlined">{t("admin.dashboard.nav.leads")}</Button>
              </Link>
            ) : null}
            {showPersons ? (
              <Link href={`/${tenantSlug}/crm/persons`}>
                <Button variant="outlined">{t("admin.dashboard.nav.persons")}</Button>
              </Link>
            ) : null}
            {showImport ? (
              <Link href={`/${tenantSlug}/crm/import`}>
                <Button variant="outlined">{t("admin.dashboard.nav.import")}</Button>
              </Link>
            ) : null}
            {showDocuments ? (
              <Link href={`/${tenantSlug}/crm/documents`}>
                <Button variant="outlined">{t("admin.dashboard.nav.documents")}</Button>
              </Link>
            ) : null}
            {showOffers ? (
              <Link href={`/${tenantSlug}/offers`}>
                <Button variant="outlined">{t("admin.dashboard.nav.offers")}</Button>
              </Link>
            ) : null}
            {showLocations ? (
              <Link href={`/${tenantSlug}/settings/locations`}>
                <Button variant="outlined">{t("admin.dashboard.nav.locations")}</Button>
              </Link>
            ) : null}
            {showTeam ? (
              <Link href={`/${tenantSlug}/settings/team`}>
                <Button variant="outlined">{t("admin.dashboard.nav.team")}</Button>
              </Link>
            ) : null}
          </Stack>
        ) : null}
        <Stack direction="row" spacing={1} sx={{ flexWrap: "wrap" }} useFlexGap>
          {session.roles.map((role) => (
            <Chip key={role} label={role} size="small" />
          ))}
        </Stack>
        <Typography variant="body2">
          {t("admin.dashboard.visibleLocations.label")}{" "}
          {session.locationIds === undefined
            ? t("admin.dashboard.visibleLocations.all")
            : session.locationIds.length === 0
              ? t("admin.dashboard.visibleLocations.none")
              : session.locationIds.join(", ")}
        </Typography>
      </Stack>
    </SurfaceShell>
  );
}
