import { canCreateTenant } from "@afterhive/api/platform/can-create-tenant";
import { canListTenants } from "@afterhive/api/platform/can-list-tenants";
import type { createTranslator } from "@afterhive/shared/i18n";
import type { PlatformNavSection } from "@afterhive/ui";

type BuildPlatformNavInput = {
  roles: string[];
  t: ReturnType<typeof createTranslator>;
};

export function buildPlatformNav({ roles, t }: BuildPlatformNavInput): PlatformNavSection[] {
  const items = [];

  if (canListTenants(roles)) {
    items.push({
      label: t("platform.nav.tenants"),
      href: "/tenants",
    });
  }

  if (canCreateTenant(roles)) {
    items.push({
      label: t("platform.nav.createTenant"),
      href: "/tenants/new",
    });
  }

  if (items.length === 0) {
    return [];
  }

  return [
    {
      title: t("platform.shell.sections.management"),
      items,
    },
  ];
}
