import { getAdminSessionContext } from "@afterhive/api/auth/get-admin-session";
import { canMergePersons } from "@afterhive/api/crm/can-merge-persons";
import { canReadPersons } from "@afterhive/api/crm/can-read-persons";
import { listPersons } from "@afterhive/api/crm/list-persons";
import { canExportPerson } from "@afterhive/api/gdpr/can-export-person";
import { canAnonymizePerson } from "@afterhive/api/gdpr/can-anonymize-person";
import { createTranslator, DEFAULT_LOCALE, getMessages } from "@afterhive/shared/i18n";
import { SurfaceShell } from "@afterhive/ui";
import { Box, Stack, Typography } from "@mui/material";
import Link from "next/link";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { SettingsForbidden } from "@/components/SettingsForbidden";
import { StaffLogoutButton } from "@/components/StaffLogoutButton";
import { MergePersonsForm } from "./MergePersonsForm";

const t = createTranslator(getMessages(DEFAULT_LOCALE));

type PersonsPageProps = {
  params: Promise<{ tenantSlug: string }>;
};

export default async function PersonsPage({ params }: PersonsPageProps) {
  const { tenantSlug } = await params;
  const session = await getAdminSessionContext(tenantSlug, await headers());

  if (!session) {
    redirect(`/${tenantSlug}/login`);
  }

  const personsTitle = t("admin.persons.title");

  if (!canReadPersons(session.roles, session.locationIds)) {
    return (
      <SurfaceShell surface="admin" title={personsTitle}>
        <Stack spacing={2}>
          <Stack direction="row" sx={{ justifyContent: "flex-end" }}>
            <StaffLogoutButton tenantSlug={tenantSlug} />
          </Stack>
          <SettingsForbidden tenantSlug={tenantSlug} title={personsTitle} />
        </Stack>
      </SurfaceShell>
    );
  }

  const persons = await listPersons(session);
  const showMergeForm = canMergePersons(session.roles);
  const showPrivacyLink =
    canExportPerson(session.roles, session.locationIds, session.roleAssignments) ||
    canAnonymizePerson(session.roles);
  const tableHeadings = [
    t("admin.persons.table.name"),
    t("admin.persons.table.createdAt"),
    ...(showPrivacyLink ? [t("admin.persons.table.privacy")] : []),
  ];

  return (
    <SurfaceShell surface="admin" title={personsTitle}>
      <Stack spacing={4}>
        <Stack direction="row" spacing={1} sx={{ justifyContent: "space-between", flexWrap: "wrap" }}>
          <Stack direction="row" spacing={1}>
            <Link href={`/${tenantSlug}`}>{t("admin.nav.dashboard")}</Link>
            <Link href={`/${tenantSlug}/crm/leads`}>{t("admin.nav.leads")}</Link>
          </Stack>
          <StaffLogoutButton tenantSlug={tenantSlug} />
        </Stack>

        {showMergeForm ? <MergePersonsForm tenantSlug={tenantSlug} persons={persons} /> : null}

        <Stack spacing={2}>
          <Typography variant="h6">
            {t("admin.persons.list.title", { count: persons.length })}
          </Typography>
          {persons.length === 0 ? (
            <Typography color="text.secondary">{t("admin.persons.list.empty")}</Typography>
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
                    {persons.map((person) => (
                      <Box component="tr" key={person.id}>
                        <Box
                          component="td"
                          sx={{ py: 1.5, px: 1, borderBottom: 1, borderColor: "divider" }}
                        >
                          {person.firstName} {person.lastName}
                        </Box>
                        <Box
                          component="td"
                          sx={{ py: 1.5, px: 1, borderBottom: 1, borderColor: "divider" }}
                        >
                          {new Date(person.createdAt).toLocaleDateString("de-DE")}
                        </Box>
                        {showPrivacyLink ? (
                          <Box
                            component="td"
                            sx={{ py: 1.5, px: 1, borderBottom: 1, borderColor: "divider" }}
                          >
                            <Link href={`/${tenantSlug}/crm/persons/${person.id}/privacy`}>
                              {t("admin.persons.privacy.link")}
                            </Link>
                          </Box>
                        ) : null}
                      </Box>
                    ))}
                  </Box>
                </Box>
              </Box>

              <Stack spacing={1.5} sx={{ display: { xs: "flex", md: "none" } }}>
                {persons.map((person) => (
                  <Box
                    key={person.id}
                    sx={{
                      p: 2,
                      border: 1,
                      borderColor: "divider",
                      borderRadius: 1,
                    }}
                  >
                    <Typography variant="subtitle1">
                      {person.firstName} {person.lastName}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {new Date(person.createdAt).toLocaleDateString("de-DE")}
                    </Typography>
                    {showPrivacyLink ? (
                      <Link href={`/${tenantSlug}/crm/persons/${person.id}/privacy`}>
                        {t("admin.persons.privacy.link")}
                      </Link>
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
