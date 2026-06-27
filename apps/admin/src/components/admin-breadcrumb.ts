import type { createTranslator } from "@afterhive/shared/i18n";

const breadcrumbMatchers: Array<{
  pattern: RegExp;
  labelKey: `admin.nav.${string}` | "admin.dashboard.title";
}> = [
  { pattern: /\/crm\/leads(\/|$)/, labelKey: "admin.nav.leads" },
  { pattern: /\/crm\/persons(\/|$)/, labelKey: "admin.nav.persons" },
  { pattern: /\/crm\/import(\/|$)/, labelKey: "admin.nav.import" },
  { pattern: /\/crm\/documents(\/|$)/, labelKey: "admin.nav.documents" },
  { pattern: /\/offers(\/|$)/, labelKey: "admin.nav.offers" },
  { pattern: /\/sessions(\/|$)/, labelKey: "admin.nav.sessions" },
  { pattern: /\/club\/teams(\/|$)/, labelKey: "admin.nav.teams" },
  { pattern: /\/settings\/locations(\/|$)/, labelKey: "admin.nav.locations" },
  { pattern: /\/settings\/team(\/|$)/, labelKey: "admin.nav.team" },
];

export function buildAdminBreadcrumb(
  pathname: string,
  tenantSlug: string,
  t: ReturnType<typeof createTranslator>,
) {
  const base = `/${tenantSlug}`;

  if (pathname === base || pathname === `${base}/`) {
    return t("admin.nav.dashboard");
  }

  const match = breadcrumbMatchers.find((entry) => entry.pattern.test(pathname));

  if (match) {
    return `${t("admin.nav.dashboard")} / ${t(match.labelKey)}`;
  }

  return t("admin.nav.dashboard");
}
