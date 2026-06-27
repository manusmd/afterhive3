import type { createTranslator } from "@afterhive/shared/i18n";

export function buildPlatformBreadcrumb(
  pathname: string,
  t: ReturnType<typeof createTranslator>,
) {
  if (pathname === "/tenants" || pathname === "/tenants/") {
    return t("platform.nav.tenants");
  }

  if (pathname.startsWith("/tenants/new")) {
    return `${t("platform.nav.tenants")} / ${t("platform.nav.createTenant")}`;
  }

  return t("platform.nav.tenants");
}
