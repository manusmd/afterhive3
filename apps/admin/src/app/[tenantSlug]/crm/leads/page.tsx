import { canConvertLead, isLeadConvertibleStatus } from "@afterhive/api/crm/can-convert-lead";
import { canCreateLead } from "@afterhive/api/crm/can-create-lead";
import { canReadLeads } from "@afterhive/api/crm/can-read-leads";
import { canUpdateLeadStatus } from "@afterhive/api/crm/can-update-lead";
import { listLeadFormLocations } from "@afterhive/api/crm/create-lead";
import {
  canReopenLostLead,
  getAllowedLeadTransitions,
} from "@afterhive/api/crm/lead-status";
import { listLeads } from "@afterhive/api/crm/list-leads";
import { getAdminSessionContext } from "@afterhive/api/auth/get-admin-session";
import {
  createTranslator,
  DEFAULT_LOCALE,
  getMessages,
  translateLeadSource,
  translateLeadStatus,
} from "@afterhive/shared/i18n";
import { Panel, StatusChip } from "@afterhive/ui";
import { Box, Stack, Typography } from "@mui/material";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { AdminPageFrame } from "@/components/AdminPageFrame";
import { SettingsForbidden } from "@/components/SettingsForbidden";
import { ConvertLeadButton } from "./ConvertLeadButton";
import { CreateLeadForm } from "./CreateLeadForm";
import { LeadStatusActions } from "./LeadStatusActions";

const t = createTranslator(getMessages(DEFAULT_LOCALE));

function resolveLeadPipelineTransitions(
  roles: string[],
  currentStatus: string,
): string[] {
  return getAllowedLeadTransitions(currentStatus).filter(
    (status) => status !== "new" || canReopenLostLead(roles),
  );
}

function resolveLeadStatusTone(status: string) {
  switch (status) {
    case "new":
      return "warning" as const;
    case "qualified":
    case "converted":
      return "success" as const;
    case "lost":
      return "error" as const;
    default:
      return "neutral" as const;
  }
}

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
      <AdminPageFrame title={leadsTitle}>
        <SettingsForbidden tenantSlug={tenantSlug} />
      </AdminPageFrame>
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
  const showPipelineAction = canUpdateLeadStatus(
    session.roles,
    session.locationIds,
    session.roleAssignments,
  );
  const showRowActions = showConvertAction || showPipelineAction;
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
    ...(showRowActions ? [t("admin.leads.table.actions")] : []),
  ];

  return (
    <AdminPageFrame
      title={leadsTitle}
      subtitle={`${t("admin.leads.visibleLocations.label")} ${scopedLocations}`}
    >
      <Stack spacing={2}>
        {showCreateForm ? (
          <Panel>
            <CreateLeadForm tenantSlug={tenantSlug} locations={formLocations} />
          </Panel>
        ) : null}

        <Panel>
          <Typography variant="h6" sx={{ mb: 2 }}>
            {t("admin.leads.list.title", { count: leads.length })}
          </Typography>
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
                    {leads.map((lead) => {
                      const pipelineTransitions = showPipelineAction
                        ? resolveLeadPipelineTransitions(session.roles, lead.status)
                        : [];
                      const showConvertButton =
                        showConvertAction && isLeadConvertibleStatus(lead.status);

                      return (
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
                            <StatusChip
                              label={translateLeadStatus(t, lead.status)}
                              tone={resolveLeadStatusTone(lead.status)}
                            />
                          </Box>
                          <Box
                            component="td"
                            sx={{ py: 1.5, px: 1, borderBottom: 1, borderColor: "divider" }}
                          >
                            {translateLeadSource(t, lead.source)}
                          </Box>
                          {showRowActions ? (
                            <Box
                              component="td"
                              sx={{ py: 1.5, px: 1, borderBottom: 1, borderColor: "divider" }}
                            >
                              <Stack spacing={1}>
                                {pipelineTransitions.length > 0 ? (
                                  <LeadStatusActions
                                    tenantSlug={tenantSlug}
                                    leadId={lead.id}
                                    allowedTransitions={pipelineTransitions}
                                  />
                                ) : null}
                                {showConvertButton ? (
                                  <ConvertLeadButton tenantSlug={tenantSlug} leadId={lead.id} />
                                ) : null}
                              </Stack>
                            </Box>
                          ) : null}
                        </Box>
                      );
                    })}
                  </Box>
                </Box>
              </Box>

              <Stack spacing={1.5} sx={{ display: { xs: "flex", md: "none" } }}>
                {leads.map((lead) => {
                  const pipelineTransitions = showPipelineAction
                    ? resolveLeadPipelineTransitions(session.roles, lead.status)
                    : [];
                  const showConvertButton =
                    showConvertAction && isLeadConvertibleStatus(lead.status);

                  return (
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
                        {lead.locationName} · {translateLeadSource(t, lead.source)}
                      </Typography>
                      <Box sx={{ mt: 1 }}>
                        <StatusChip
                          label={translateLeadStatus(t, lead.status)}
                          tone={resolveLeadStatusTone(lead.status)}
                        />
                      </Box>
                      {pipelineTransitions.length > 0 ? (
                        <Box sx={{ mt: 1 }}>
                          <LeadStatusActions
                            tenantSlug={tenantSlug}
                            leadId={lead.id}
                            allowedTransitions={pipelineTransitions}
                          />
                        </Box>
                      ) : null}
                      {showConvertButton ? (
                        <Box sx={{ mt: 1 }}>
                          <ConvertLeadButton tenantSlug={tenantSlug} leadId={lead.id} />
                        </Box>
                      ) : null}
                    </Box>
                  );
                })}
              </Stack>
            </>
          )}
        </Panel>
      </Stack>
    </AdminPageFrame>
  );
}
