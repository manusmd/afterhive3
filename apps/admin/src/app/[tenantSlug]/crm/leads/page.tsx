import { canConvertLead, isLeadConvertibleStatus } from "@afterhive/api/crm/can-convert-lead";
import { canCreateLead } from "@afterhive/api/crm/can-create-lead";
import { canReadLeads } from "@afterhive/api/crm/can-read-leads";
import { listLeadFormLocations } from "@afterhive/api/crm/create-lead";
import { listLeads } from "@afterhive/api/crm/list-leads";
import { getAdminSessionContext } from "@afterhive/api/auth/get-admin-session";
import {
  createTranslator,
  DEFAULT_LOCALE,
  getMessages,
  translateLeadSource,
  translateLeadStatus,
} from "@afterhive/shared/i18n";
import { SurfaceShell } from "@afterhive/ui";
import { Box, Stack, Typography } from "@mui/material";
import Link from "next/link";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { SettingsForbidden } from "@/components/SettingsForbidden";
import { StaffLogoutButton } from "@/components/StaffLogoutButton";
import { ConvertLeadButton } from "./ConvertLeadButton";
import { CreateLeadForm } from "./CreateLeadForm";

const t = createTranslator(getMessages(DEFAULT_LOCALE));

type LeadsPageProps = {
  params: Promise<{ tenantSlug: string }>;
};

export default async function LeadsPage({ params }: LeadsPageProps) {
  const { tenantSlug } = await params;
  const session = await getAdminSessionContext(tenantSlug, await headers());

  if (!session) {
    redirect(`/${tenantSlug}/login`);
  }

  const leadsTitle = t("admin.leads.title");

  if (!canReadLeads(session.roles, session.locationIds)) {
    return (
      <SurfaceShell surface="admin" title={leadsTitle}>
        <Stack spacing={2}>
          <Stack direction="row" sx={{ justifyContent: "flex-end" }}>
            <StaffLogoutButton tenantSlug={tenantSlug} />
          </Stack>
          <SettingsForbidden tenantSlug={tenantSlug} title={leadsTitle} />
        </Stack>
      </SurfaceShell>
    );
  }

  const leads = await listLeads(session);
  const showCreateForm = canCreateLead(
    session.roles,
    session.locationIds,
    session.roleAssignments,
  );
  const formLocations = showCreateForm ? await listLeadFormLocations(session, tenantSlug) : [];
  const showConvertAction = canConvertLead(
    session.roles,
    session.locationIds,
    session.roleAssignments,
  );
  const scopedLocations =
    session.locationIds === undefined
      ? t("admin.leads.visibleLocations.all")
      : session.locationIds.length === 0
        ? t("admin.leads.visibleLocations.none")
        : t("admin.leads.visibleLocations.count", { count: session.locationIds.length });
  const tableHeadings = [
    t("admin.leads.table.name"),
    t("admin.leads.table.location"),
    t("admin.leads.table.status"),
    t("admin.leads.table.source"),
    ...(showConvertAction ? [t("admin.leads.table.actions")] : []),
  ];

  return (
    <SurfaceShell surface="admin" title={leadsTitle}>
      <Stack spacing={4}>
        <Stack direction="row" spacing={1} sx={{ justifyContent: "space-between", flexWrap: "wrap" }}>
          <Link href={`/${tenantSlug}`}>{t("admin.nav.dashboard")}</Link>
          <StaffLogoutButton tenantSlug={tenantSlug} />
        </Stack>

        <Typography color="text.secondary">
          {t("admin.leads.visibleLocations.label")} {scopedLocations}
        </Typography>

        {showCreateForm ? (
          <CreateLeadForm tenantSlug={tenantSlug} locations={formLocations} />
        ) : null}

        <Stack spacing={2}>
          <Typography variant="h6">{t("admin.leads.list.title", { count: leads.length })}</Typography>
          {leads.length === 0 ? (
            <Typography color="text.secondary">{t("admin.leads.list.empty")}</Typography>
          ) : (
            <>
              <Box sx={{ display: { xs: "none", md: "block" } }}>
                <Box component="table" sx={{ width: "100%", borderCollapse: "collapse" }}>
                  <Box component="thead">
                    <Box component="tr">
                      {tableHeadings.map((heading) => (
                        <Box
                          component="th"
                          key={heading}
                          sx={{
                            textAlign: "left",
                            py: 1.5,
                            px: 1,
                            borderBottom: 1,
                            borderColor: "divider",
                            typography: "subtitle2",
                          }}
                        >
                          {heading}
                        </Box>
                      ))}
                    </Box>
                  </Box>
                  <Box component="tbody">
                    {leads.map((lead) => (
                      <Box component="tr" key={lead.id}>
                        <Box
                          component="td"
                          sx={{ py: 1.5, px: 1, borderBottom: 1, borderColor: "divider" }}
                        >
                          {lead.firstName} {lead.lastName}
                        </Box>
                        <Box
                          component="td"
                          sx={{ py: 1.5, px: 1, borderBottom: 1, borderColor: "divider" }}
                        >
                          {lead.locationName}
                        </Box>
                        <Box
                          component="td"
                          sx={{ py: 1.5, px: 1, borderBottom: 1, borderColor: "divider" }}
                        >
                          {translateLeadStatus(t, lead.status)}
                        </Box>
                        <Box
                          component="td"
                          sx={{ py: 1.5, px: 1, borderBottom: 1, borderColor: "divider" }}
                        >
                          {translateLeadSource(t, lead.source)}
                        </Box>
                        {showConvertAction && isLeadConvertibleStatus(lead.status) ? (
                          <Box
                            component="td"
                            sx={{ py: 1.5, px: 1, borderBottom: 1, borderColor: "divider" }}
                          >
                            <ConvertLeadButton tenantSlug={tenantSlug} leadId={lead.id} />
                          </Box>
                        ) : showConvertAction ? (
                          <Box
                            component="td"
                            sx={{ py: 1.5, px: 1, borderBottom: 1, borderColor: "divider" }}
                          />
                        ) : null}
                      </Box>
                    ))}
                  </Box>
                </Box>
              </Box>

              <Stack spacing={1.5} sx={{ display: { xs: "flex", md: "none" } }}>
                {leads.map((lead) => (
                  <Box
                    key={lead.id}
                    sx={{
                      p: 2,
                      border: 1,
                      borderColor: "divider",
                      borderRadius: 1,
                    }}
                  >
                    <Typography variant="subtitle1">
                      {lead.firstName} {lead.lastName}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {lead.locationName} · {translateLeadStatus(t, lead.status)} ·{" "}
                      {translateLeadSource(t, lead.source)}
                    </Typography>
                    {showConvertAction && isLeadConvertibleStatus(lead.status) ? (
                      <Box sx={{ mt: 1 }}>
                        <ConvertLeadButton tenantSlug={tenantSlug} leadId={lead.id} />
                      </Box>
                    ) : null}
                  </Box>
                ))}
              </Stack>
            </>
          )}
        </Stack>
      </Stack>
    </SurfaceShell>
  );
}
