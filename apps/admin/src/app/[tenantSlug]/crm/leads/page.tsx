import { canCreateLead } from "@afterhive/api/crm/can-create-lead";
import { canReadLeads } from "@afterhive/api/crm/can-read-leads";
import { listLeadFormLocations } from "@afterhive/api/crm/create-lead";
import { listLeads } from "@afterhive/api/crm/list-leads";
import { getAdminSessionContext } from "@afterhive/api/auth/get-admin-session";
import { SurfaceShell } from "@afterhive/ui";
import { Box, Stack, Typography } from "@mui/material";
import Link from "next/link";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { SettingsForbidden } from "@/components/SettingsForbidden";
import { StaffLogoutButton } from "@/components/StaffLogoutButton";
import { CreateLeadForm } from "./CreateLeadForm";

type LeadsPageProps = {
  params: Promise<{ tenantSlug: string }>;
};

export default async function LeadsPage({ params }: LeadsPageProps) {
  const { tenantSlug } = await params;
  const session = await getAdminSessionContext(tenantSlug, await headers());

  if (!session) {
    redirect(`/${tenantSlug}/login`);
  }

  if (!canReadLeads(session.roles, session.locationIds)) {
    return (
      <SurfaceShell surface="admin" title="Leads">
        <Stack spacing={2}>
          <Stack direction="row" sx={{ justifyContent: "flex-end" }}>
            <StaffLogoutButton tenantSlug={tenantSlug} />
          </Stack>
          <SettingsForbidden tenantSlug={tenantSlug} title="Leads" />
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
  const scopedLocations =
    session.locationIds === undefined
      ? "alle Standorte"
      : session.locationIds.length === 0
        ? "keine Standorte zugewiesen"
        : `${session.locationIds.length} Standort(e)`;

  return (
    <SurfaceShell surface="admin" title="Leads">
      <Stack spacing={4}>
        <Stack direction="row" spacing={1} sx={{ justifyContent: "space-between", flexWrap: "wrap" }}>
          <Link href={`/${tenantSlug}`}>Dashboard</Link>
          <StaffLogoutButton tenantSlug={tenantSlug} />
        </Stack>

        <Typography color="text.secondary">
          Sichtbare Standorte: {scopedLocations}
        </Typography>

        {showCreateForm ? (
          <CreateLeadForm tenantSlug={tenantSlug} locations={formLocations} />
        ) : null}

        <Stack spacing={2}>
          <Typography variant="h6">Leads ({leads.length})</Typography>
          {leads.length === 0 ? (
            <Typography color="text.secondary">Keine Leads in Ihren sichtbaren Standorten.</Typography>
          ) : (
            <>
              <Box sx={{ display: { xs: "none", md: "block" } }}>
                <Box component="table" sx={{ width: "100%", borderCollapse: "collapse" }}>
                  <Box component="thead">
                    <Box component="tr">
                      {["Name", "Standort", "Status", "Quelle"].map((heading) => (
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
                          {lead.status}
                        </Box>
                        <Box
                          component="td"
                          sx={{ py: 1.5, px: 1, borderBottom: 1, borderColor: "divider" }}
                        >
                          {lead.source}
                        </Box>
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
                      {lead.locationName} · {lead.status} · {lead.source}
                    </Typography>
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
