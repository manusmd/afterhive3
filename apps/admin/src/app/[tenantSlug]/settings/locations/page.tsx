import { getAdminSessionContext } from "@afterhive/api/auth/get-admin-session";
import {
  canCreateLocation,
  canViewLocations,
} from "@afterhive/api/location/can-manage-locations";
import { listLocations } from "@afterhive/api/location/list-locations";
import { createTranslator, DEFAULT_LOCALE, getMessages } from "@afterhive/shared/i18n";
import { Panel } from "@afterhive/ui";
import { Box, Stack, Typography } from "@mui/material";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { AdminPageFrame } from "@/components/AdminPageFrame";
import { SettingsForbidden } from "@/components/SettingsForbidden";
import { CreateLocationForm } from "./CreateLocationForm";

const t = createTranslator(getMessages(DEFAULT_LOCALE));

type LocationsSettingsPageProps = {
  params: Promise<{ tenantSlug: string }>;
};

export default async function LocationsSettingsPage({ params }: LocationsSettingsPageProps) {
  const { tenantSlug } = await params;
  const session = await getAdminSessionContext(tenantSlug, await headers());

  if (!session) {
    redirect(`/${tenantSlug}/login`);
  }

  const locationsTitle = t("admin.locations.title");

  if (!canViewLocations(session.roles)) {
    return (
      <AdminPageFrame title={locationsTitle}>
        <SettingsForbidden tenantSlug={tenantSlug} />
      </AdminPageFrame>
    );
  }

  const locations = await listLocations(tenantSlug);
  const showCreateForm = canCreateLocation(session.roles);
  const tableHeadings = [
    t("admin.locations.table.name"),
    t("admin.locations.table.created"),
  ];

  return (
    <AdminPageFrame title={locationsTitle}>
      <Stack spacing={2}>
        {showCreateForm ? (
          <Panel>
            <CreateLocationForm tenantSlug={tenantSlug} />
          </Panel>
        ) : null}

        <Panel>
          <Typography variant="h6" sx={{ mb: 2 }}>
            {t("admin.locations.list.title", { count: locations.length })}
          </Typography>
          {locations.length === 0 ? (
            <Typography color="text.secondary">{t("admin.locations.list.empty")}</Typography>
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
                    {locations.map((location) => (
                      <Box component="tr" key={location.id}>
                        <Box
                          component="td"
                          sx={{ py: 1.5, px: 1, borderBottom: 1, borderColor: "divider" }}
                        >
                          {location.name}
                        </Box>
                        <Box
                          component="td"
                          sx={{ py: 1.5, px: 1, borderBottom: 1, borderColor: "divider" }}
                        >
                          {formatDate(location.createdAt)}
                        </Box>
                      </Box>
                    ))}
                  </Box>
                </Box>
              </Box>

              <Stack spacing={1.5} sx={{ display: { xs: "flex", md: "none" } }}>
                {locations.map((location) => (
                  <Box
                    key={location.id}
                    sx={{
                      p: 2,
                      border: 1,
                      borderColor: "divider",
                      borderRadius: 1,
                    }}
                  >
                    <Typography variant="subtitle1">{location.name}</Typography>
                    <Typography variant="caption" color="text.secondary">
                      {formatDate(location.createdAt)}
                    </Typography>
                  </Box>
                ))}
              </Stack>
            </>
          )}
        </Panel>
      </Stack>
    </AdminPageFrame>
  );
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("de-DE", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}
