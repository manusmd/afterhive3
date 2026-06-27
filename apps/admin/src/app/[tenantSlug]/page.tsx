import { getAdminAuth } from "@afterhive/api/auth/admin-auth";
import { getAdminSessionContext } from "@afterhive/api/auth/get-admin-session";
import {
  countSessionsOnDate,
  parseUpcomingSessions,
} from "@afterhive/api/admin/dashboard-upcoming-sessions";
import { listAttendanceSessions } from "@afterhive/api/attendance/list-session-attendance";
import { canReadSessions } from "@afterhive/api/attendance/can-read-sessions";
import { canCreateLead } from "@afterhive/api/crm/can-create-lead";
import { canRunImport } from "@afterhive/api/crm/can-run-import";
import { canReadLeads } from "@afterhive/api/crm/can-read-leads";
import { listLeads } from "@afterhive/api/crm/list-leads";
import { canReadPersons } from "@afterhive/api/crm/can-read-persons";
import { listPersons } from "@afterhive/api/crm/list-persons";
import { canReadOffers } from "@afterhive/api/offer/can-read-offers";
import { listOffers } from "@afterhive/api/offer/list-offers";
import { getTenantDisplayName } from "@afterhive/api/tenant/get-tenant-display-name";
import {
  createTranslator,
  DEFAULT_LOCALE,
  getMessages,
  translateLeadStatus,
} from "@afterhive/shared/i18n";
import {
  PageHeader,
  Panel,
  QuickActionBar,
  StatCard,
  StatusChip,
} from "@afterhive/ui";
import { Box, Button, Divider, Stack, Typography } from "@mui/material";
import Link from "next/link";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { StaffLogoutButton } from "@/components/StaffLogoutButton";

const t = createTranslator(getMessages(DEFAULT_LOCALE));
const sessionDateFormatter = new Intl.DateTimeFormat("de-DE", {
  dateStyle: "medium",
  timeStyle: "short",
});

const OPEN_LEAD_STATUSES = new Set(["new", "contacted", "qualified"]);
const TASK_LEAD_STATUSES = new Set(["new", "contacted"]);

type TenantDashboardProps = {
  params: Promise<{ tenantSlug: string }>;
};

export default async function TenantDashboardPage({ params }: TenantDashboardProps) {
  const { tenantSlug } = await params;
  const requestHeaders = await headers();
  const authSession = await getAdminAuth().api.getSession({ headers: requestHeaders });
  const session = await getAdminSessionContext(tenantSlug, requestHeaders);

  if (!session) {
    redirect(`/${tenantSlug}/login`);
  }

  const userName = authSession?.user?.name ?? authSession?.user?.email ?? t("admin.dashboard.title");
  const tenantName = await getTenantDisplayName(tenantSlug);

  const showLeads = canReadLeads(session.roles, session.locationIds);
  const showPersons = canReadPersons(session.roles, session.locationIds);
  const showImport = canRunImport(session.roles, session.locationIds, session.roleAssignments);
  const showOffers = canReadOffers(session.roles, session.locationIds);
  const showSessions = canReadSessions(session.roles, session.locationIds);
  const showCreateLead = canCreateLead(
    session.roles,
    session.locationIds,
    session.roleAssignments,
  );

  const [leads, persons, offers, sessionItems] = await Promise.all([
    showLeads ? listLeads(session) : Promise.resolve([]),
    showPersons ? listPersons(session) : Promise.resolve([]),
    showOffers ? listOffers(session, tenantSlug) : Promise.resolve([]),
    showSessions ? listAttendanceSessions(session, tenantSlug) : Promise.resolve([]),
  ]);

  const openLeads = leads.filter((lead) => OPEN_LEAD_STATUSES.has(lead.status));
  const newLeads = leads.filter((lead) => lead.status === "new");
  const publishedOffers = offers.filter((offer) => offer.status === "published");
  const allUpcomingSessions = parseUpcomingSessions(sessionItems, 1000);
  const upcomingSessions = allUpcomingSessions.slice(0, 5);
  const sessionsToday = countSessionsOnDate(allUpcomingSessions, new Date(), "Europe/Berlin");
  const taskLeads = leads
    .filter((lead) => TASK_LEAD_STATUSES.has(lead.status))
    .slice(0, 5);

  return (
    <>
      <PageHeader
        title={t("admin.dashboard.greeting", { name: userName })}
        subtitle={t("admin.dashboard.subtitle", { tenantName })}
        actions={<StaffLogoutButton tenantSlug={tenantSlug} />}
      />

      {showCreateLead || showImport || showSessions ? (
        <QuickActionBar>
          {showCreateLead ? (
            <Link href={`/${tenantSlug}/crm/leads`}>
              <Button variant="contained">{t("admin.dashboard.quickActions.createLead")}</Button>
            </Link>
          ) : null}
          {showImport ? (
            <Link href={`/${tenantSlug}/crm/import`}>
              <Button variant="outlined">{t("admin.dashboard.quickActions.importLeads")}</Button>
            </Link>
          ) : null}
          {showSessions ? (
            <Link href={`/${tenantSlug}/sessions`}>
              <Button variant="outlined">{t("admin.dashboard.quickActions.viewSessions")}</Button>
            </Link>
          ) : null}
        </QuickActionBar>
      ) : null}

      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr", lg: "repeat(4, 1fr)" },
          gap: 2,
          mb: 3,
        }}
      >
        {showLeads ? (
          <StatCard
            label={t("admin.dashboard.kpis.openLeads")}
            value={openLeads.length}
            hint={
              newLeads.length > 0
                ? t("admin.dashboard.kpisHint.newLeads", { count: newLeads.length })
                : undefined
            }
            tone={newLeads.length > 0 ? "warning" : "default"}
          />
        ) : null}
        {showPersons ? (
          <StatCard
            label={t("admin.dashboard.kpis.members")}
            value={persons.length}
          />
        ) : null}
        {showSessions ? (
          <StatCard
            label={t("admin.dashboard.kpis.upcomingSessions")}
            value={allUpcomingSessions.length}
            hint={
              sessionsToday > 0
                ? t("admin.dashboard.kpisHint.todaySessions", { count: sessionsToday })
                : undefined
            }
            tone={sessionsToday > 0 ? "info" : "default"}
          />
        ) : null}
        {showOffers ? (
          <StatCard
            label={t("admin.dashboard.kpis.publishedOffers")}
            value={publishedOffers.length}
          />
        ) : null}
      </Box>

      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "1fr", lg: "1.4fr 1fr" },
          gap: 2,
        }}
      >
        {showSessions ? (
          <Panel>
            <Stack direction="row" sx={{ alignItems: "center", justifyContent: "space-between", mb: 2 }}>
              <Typography variant="h6">{t("admin.dashboard.sections.upcomingSessions")}</Typography>
              <Link href={`/${tenantSlug}/sessions`}>
                <Button size="small" variant="text">
                  {t("admin.dashboard.sessions.viewAll")}
                </Button>
              </Link>
            </Stack>
            {upcomingSessions.length === 0 ? (
              <Typography color="text.secondary">{t("admin.dashboard.sessions.empty")}</Typography>
            ) : (
              <Stack divider={<Divider flexItem />} spacing={1.5}>
                {upcomingSessions.map((item) => (
                  <Stack
                    key={item.sessionId}
                    direction={{ xs: "column", sm: "row" }}
                    spacing={1}
                    sx={{ alignItems: { sm: "center" }, justifyContent: "space-between" }}
                  >
                    <Box>
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>
                        {item.title}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {sessionDateFormatter.format(item.startsAt)}
                      </Typography>
                    </Box>
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
        ) : null}

        <Stack spacing={2}>
          {showLeads ? (
            <Panel>
              <Typography variant="h6" sx={{ mb: 2 }}>
                {t("admin.dashboard.sections.tasks")}
              </Typography>
              {taskLeads.length === 0 ? (
                <Typography color="text.secondary">{t("admin.dashboard.tasks.empty")}</Typography>
              ) : (
                <Stack divider={<Divider flexItem />} spacing={1.5}>
                  {taskLeads.map((lead) => (
                    <Stack
                      key={lead.id}
                      direction={{ xs: "column", sm: "row" }}
                      spacing={1}
                      sx={{ alignItems: { sm: "center" }, justifyContent: "space-between" }}
                    >
                      <Typography variant="body2">
                        {t("admin.dashboard.tasks.followUpLead", {
                          name: `${lead.firstName} ${lead.lastName}`,
                        })}
                      </Typography>
                      <StatusChip label={translateLeadStatus(t, lead.status)} tone="warning" />
                    </Stack>
                  ))}
                </Stack>
              )}
            </Panel>
          ) : null}

          <Panel>
            <Typography variant="h6" sx={{ mb: 2 }}>
              {t("admin.dashboard.sections.hints")}
            </Typography>
            <Stack spacing={1.5}>
              {showImport ? (
                <Typography variant="body2" color="text.secondary">
                  {t("admin.dashboard.hints.import")}
                </Typography>
              ) : null}
              {showSessions ? (
                <Typography variant="body2" color="text.secondary">
                  {t("admin.dashboard.hints.sessions")}
                </Typography>
              ) : null}
            </Stack>
          </Panel>
        </Stack>
      </Box>
    </>
  );
}
