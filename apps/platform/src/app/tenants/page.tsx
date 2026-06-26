import { getPlatformSessionContext } from "@afterhive/api/auth/get-platform-session";
import { canCreateTenant } from "@afterhive/api/platform/can-create-tenant";
import { canListTenants } from "@afterhive/api/platform/can-list-tenants";
import { listTenants, parseTenantStatus } from "@afterhive/api/platform/list-tenants";
import { SurfaceShell } from "@afterhive/ui";
import { Stack } from "@mui/material";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { PlatformToolbar } from "@/components/PlatformToolbar";
import { TenantList, TenantListError, TenantListFilters } from "./TenantList";

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

  let result;

  try {
    result = await listTenants({
      status: parseTenantStatus(params.status),
      planId: params.plan?.trim() || undefined,
      cursor: params.cursor,
    });
  } catch {
    return (
      <SurfaceShell surface="platform" title="Tenants">
        <TenantListError />
      </SurfaceShell>
    );
  }

  return (
    <SurfaceShell surface="platform" title="Tenants">
      <Stack spacing={3}>
        <PlatformToolbar showCreateTenant={canCreateTenant(session.roles)} />
        <Suspense fallback={null}>
          <Stack spacing={3}>
            <TenantListFilters />
            <TenantList items={result.items} nextCursor={result.nextCursor} />
          </Stack>
        </Suspense>
      </Stack>
    </SurfaceShell>
  );
}
