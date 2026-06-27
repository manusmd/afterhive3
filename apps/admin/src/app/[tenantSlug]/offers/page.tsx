import { getAdminSessionContext } from "@afterhive/api/auth/get-admin-session";
import { canEndEnrollment } from "@afterhive/api/enrollment/can-end-enrollment";
import { canEnrollMember } from "@afterhive/api/enrollment/can-enroll-member";
import { listEnrollFormOptions } from "@afterhive/api/enrollment/enroll-member";
import { listEnrollments } from "@afterhive/api/enrollment/list-enrollments";
import { canAssignSessionStaff } from "@afterhive/api/schedule/can-assign-session-staff";
import { listSessionStaffFormOptions } from "@afterhive/api/schedule/assign-session-staff";
import { canCreateOffer } from "@afterhive/api/offer/can-create-offer";
import { canReadOffers } from "@afterhive/api/offer/can-read-offers";
import { listOfferFormLocations } from "@afterhive/api/offer/create-offer";
import { listOffers } from "@afterhive/api/offer/list-offers";
import { createTranslator, DEFAULT_LOCALE, getMessages, translateOfferStatus, translateOfferType } from "@afterhive/shared/i18n";
import { SurfaceShell } from "@afterhive/ui";
import { Stack, Typography } from "@mui/material";
import Link from "next/link";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { SettingsForbidden } from "@/components/SettingsForbidden";
import { StaffLogoutButton } from "@/components/StaffLogoutButton";
import { AssignSessionStaffForm } from "./AssignSessionStaffForm";
import { CreateOfferForm } from "./CreateOfferForm";
import { EndEnrollmentButton } from "./EndEnrollmentButton";
import { EnrollMemberForm } from "./EnrollMemberForm";

const t = createTranslator(getMessages(DEFAULT_LOCALE));

type OffersPageProps = {
  params: Promise<{ tenantSlug: string }>;
};

export default async function OffersPage({ params }: OffersPageProps) {
  const { tenantSlug } = await params;
  const session = await getAdminSessionContext(tenantSlug, await headers());

  if (!session) {
    redirect(`/${tenantSlug}/login`);
  }

  const pageTitle = t("admin.offers.title");

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

  const showCreateForm = canCreateOffer(
    session.roles,
    session.locationIds,
    session.roleAssignments,
  );
  const showEnrollForm = canEnrollMember(
    session.roles,
    session.locationIds,
    session.roleAssignments,
  );
  const showEndEnrollment = canEndEnrollment(
    session.roles,
    session.locationIds,
    session.roleAssignments,
  );
  const showAssignStaff = canAssignSessionStaff(
    session.roles,
    session.locationIds,
    session.roleAssignments,
  );
  const locations = showCreateForm ? await listOfferFormLocations(session, tenantSlug) : [];
  const enrollOptions = showEnrollForm ? await listEnrollFormOptions(session, tenantSlug) : null;
  const activeEnrollments = showEndEnrollment ? await listEnrollments(session, tenantSlug) : [];
  const staffAssignOptions = showAssignStaff
    ? await listSessionStaffFormOptions(session, tenantSlug)
    : null;
  const offers = await listOffers(session, tenantSlug);

  return (
    <SurfaceShell surface="admin" title={pageTitle}>
      <Stack spacing={4}>
        <Stack direction="row" spacing={1} sx={{ justifyContent: "space-between", flexWrap: "wrap" }}>
          <Link href={`/${tenantSlug}`}>{t("admin.nav.dashboard")}</Link>
          <StaffLogoutButton tenantSlug={tenantSlug} />
        </Stack>

        {showCreateForm ? (
          <CreateOfferForm tenantSlug={tenantSlug} locations={locations} />
        ) : null}

        {showEnrollForm && enrollOptions ? (
          <Stack spacing={1}>
            <Typography variant="h6">{t("admin.enrollment.enroll.title")}</Typography>
            <EnrollMemberForm
              tenantSlug={tenantSlug}
              offerGroups={enrollOptions.offerGroups.map((group) => ({
                id: group.offerGroupId,
                label: group.label,
              }))}
              members={enrollOptions.members.map((member) => ({
                id: member.memberProfileId,
                label: member.label,
              }))}
            />
          </Stack>
        ) : null}

        {showEndEnrollment ? (
          <Stack spacing={2}>
            <Typography variant="h6">
              {t("admin.enrollment.list.title", { count: activeEnrollments.length })}
            </Typography>
            {activeEnrollments.length === 0 ? (
              <Typography color="text.secondary">{t("admin.enrollment.list.empty")}</Typography>
            ) : (
              activeEnrollments.map((enrollment) => (
                <Stack
                  key={enrollment.enrollmentId}
                  direction="row"
                  spacing={2}
                  sx={{ alignItems: "center", flexWrap: "wrap" }}
                >
                  <Typography>
                    {enrollment.memberLabel} · {enrollment.offerGroupLabel}
                  </Typography>
                  <EndEnrollmentButton
                    tenantSlug={tenantSlug}
                    enrollmentId={enrollment.enrollmentId}
                  />
                </Stack>
              ))
            )}
          </Stack>
        ) : null}

        {showAssignStaff && staffAssignOptions ? (
          <Stack spacing={1}>
            <Typography variant="h6">{t("admin.schedule.assignStaff.title")}</Typography>
            <AssignSessionStaffForm
              tenantSlug={tenantSlug}
              sessions={staffAssignOptions.sessions.map((entry) => ({
                id: entry.sessionId,
                label: entry.label,
                assignedStaff: entry.assignedStaff,
              }))}
              staff={staffAssignOptions.staff.map((entry) => ({
                id: entry.userId,
                label: entry.label,
              }))}
            />
          </Stack>
        ) : null}

        <Stack spacing={2}>
          <Typography variant="h6">
            {t("admin.offers.list.title", { count: offers.length })}
          </Typography>
          {offers.length === 0 ? (
            <Typography color="text.secondary">{t("admin.offers.list.empty")}</Typography>
          ) : (
            offers.map((offer) => (
              <Typography key={offer.offerId}>
                {offer.name} · {translateOfferType(t, offer.type)} ·{" "}
                {translateOfferStatus(t, offer.status)}
              </Typography>
            ))
          )}
        </Stack>
      </Stack>
    </SurfaceShell>
  );
}
