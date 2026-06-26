import { canReadLeads } from "@afterhive/api/crm/can-read-leads";
import { listLeads } from "@afterhive/api/crm/list-leads";
import { getAdminSessionContext } from "@afterhive/api/auth/get-admin-session";
import { SurfaceShell } from "@afterhive/ui";
import { Box, Stack, Typography } from "@mui/material";
import Link from "next/link";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { SettingsForbidden } from "@/components/SettingsForbidden";
import { StaffLogoutButton } from "@/components/StaffLogoutButton";

type LeadsPageProps = {
  params: Promise<{ tenantSlug: string }>;
};

export default async function LeadsPage({ params }: LeadsPageProps) {
  const { tenantSlug } = await params;
  const session = await getAdminSessionContext(tenantSlug, await headers());

  if (!session) {
    redirect(`/${tenantSlug}/login`);
  }

  if (!canReadLeads(session.roles)) {
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
  const scopedLocations = session.locationIds?.length
    ? `${session.locationIds.length} Standort(e)`
    : "alle Standorte";

  return (
    <SurfaceShell surface="admin" title="Leads">
      <Stack spacing={4}>
        <Stack direction="row" spacing={1} sx={{ justifyContent: "space-between", flexWrap: "wrap" }}>
          <Link href={`/${tenantSlug}`}>Dashboard</Link>
          <StaffLogoutButton tenantSlug={tenantSlug} />
        </Stack>

        <Typography color="text.secondary">
          Sichtbarer Standort-Scope: {scopedLocations}
        </Typography>

        <Stack spacing={2}>
          <Typography variant="h6">Leads ({leads.length})</Typography>
          {leads.length === 0 ? (
            <Typography color="text.secondary">Keine Leads in Ihrem Standort-Scope.</Typography>
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
