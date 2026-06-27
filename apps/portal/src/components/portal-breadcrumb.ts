import type { createTranslator } from "@afterhive/shared/i18n";

const breadcrumbMatchers: Array<{
  pattern: RegExp;
  labelKey: "portal.nav.consent" | "portal.nav.documents";
}> = [
  { pattern: /\/consent(\/|$)/, labelKey: "portal.nav.consent" },
  { pattern: /\/documents(\/|$)/, labelKey: "portal.nav.documents" },
];

export function buildPortalBreadcrumb(
  pathname: string,
  tenantSlug: string,
  t: ReturnType<typeof createTranslator>,
) {
  const match = breadcrumbMatchers.find((entry) => entry.pattern.test(pathname));

  if (match) {
    return match.labelKey === "portal.nav.consent"
      ? t("portal.nav.consent")
      : t("portal.nav.documents");
  }

  return tenantSlug;
}
