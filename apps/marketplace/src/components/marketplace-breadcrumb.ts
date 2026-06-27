import type { createTranslator } from "@afterhive/shared/i18n";

export function buildMarketplaceBreadcrumb(
  pathname: string,
  t: ReturnType<typeof createTranslator>,
) {
  if (pathname === "/" || pathname === "") {
    return t("marketplace.nav.discover");
  }

  return t("marketplace.nav.discover");
}
