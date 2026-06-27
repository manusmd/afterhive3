import type { createTranslator } from "@afterhive/shared/i18n";
import type { PortalNavSection } from "@afterhive/ui";

type BuildPortalNavInput = {
  tenantSlug: string;
  t: ReturnType<typeof createTranslator>;
};

export function buildPortalNav({ tenantSlug, t }: BuildPortalNavInput): PortalNavSection[] {
  return [
    {
      title: t("portal.shell.sections.selfService"),
      items: [
        {
          label: t("portal.nav.consent"),
          href: `/${tenantSlug}/consent`,
        },
        {
          label: t("portal.nav.documents"),
          href: `/${tenantSlug}/documents`,
        },
      ],
    },
  ];
}
