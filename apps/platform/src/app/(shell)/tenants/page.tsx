import { getPlatformSessionContext } from "@afterhive/api/auth/get-platform-session";
import { canCreateTenant } from "@afterhive/api/platform/can-create-tenant";
import { canListTenants } from "@afterhive/api/platform/can-list-tenants";
import { canSuspendTenant } from "@afterhive/api/platform/can-suspend-tenant";
import { listTenants, parseTenantStatus } from "@afterhive/api/platform/list-tenants";
import { createTranslator, DEFAULT_LOCALE, getMessages } from "@afterhive/shared/i18n";
import { Panel } from "@afterhive/ui";
import { Button, Stack } from "@mui/material";
import Link from "next/link";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { PlatformLogoutButton } from "@/components/PlatformLogoutButton";
import { PlatformPageFrame } from "@/components/PlatformPageFrame";
import { TenantList, TenantListError, TenantListFilters } from "./TenantList";

const t = createTranslator(getMessages(DEFAULT_LOCALE));

type TenantsPageProps = {
  searchParams: Promise<{
    status?: string;
    plan?: string;
    cursor?: string;
  }>;
};

export default async function TenantsPage({ searchParams }: TenantsPageProps) {
  const session = await getPlatformSessionContext(await headers());

  if (!session) {
    redirect("/login");
  }

  if (!canListTenants(session.roles)) {
    redirect("/");
  }

  const params = await searchParams;
  const showCreateTenant = canCreateTenant(session.roles);
  const pageActions = (
    <Stack direction="row" spacing={1} useFlexGap sx={{ flexWrap: "wrap" }}>
      {showCreateTenant ? (
        <Link href="/tenants/new">
          <Button variant="outlined">{t("platform.tenants.create.toolbarButton")}</Button>
        </Link>
      ) : null}
      <PlatformLogoutButton />
    </Stack>
  );

  let result;

  try {
    result = await listTenants({
      status: parseTenantStatus(params.status),
      planId: params.plan?.trim() || undefined,
      cursor: params.cursor,
    });
  } catch {
    return (
      <PlatformPageFrame title={t("platform.tenants.title")} actions={pageActions}>
        <Panel>
          <TenantListError />
        </Panel>
      </PlatformPageFrame>
    );
  }

  return (
    <PlatformPageFrame title={t("platform.tenants.title")} actions={pageActions}>
      <Stack spacing={2}>
        <Panel>
          <Suspense fallback={null}>
            <TenantListFilters />
          </Suspense>
        </Panel>
        <Panel>
          <TenantList
            items={result.items}
            nextCursor={result.nextCursor}
            canSuspend={canSuspendTenant(session.roles)}
            showCreateTenant={showCreateTenant}
          />
        </Panel>
      </Stack>
    </PlatformPageFrame>
  );
}
