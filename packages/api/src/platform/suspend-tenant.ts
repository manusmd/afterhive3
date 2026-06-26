import { eq } from "drizzle-orm";
import { getDb } from "@afterhive/db";
import { tenants } from "@afterhive/db/schema";
import { rootLogger } from "@afterhive/shared/logger";
import type { TenantStatus } from "./list-tenants";
import {
  getSuspendTenantBlockReason,
  type SuspendTenantBlockReason,
} from "./suspend-tenant-validation";

export type SuspendTenantInput = {
  tenantId: string;
  reason?: string;
  suspendedByUserId: string;
};

export type SuspendTenantResult = {
  tenantId: string;
  slug: string;
  status: TenantStatus;
};

export class SuspendTenantError extends Error {
  constructor(readonly code: "not_found" | SuspendTenantBlockReason) {
    super(code);
    this.name = "SuspendTenantError";
  }
}

export async function suspendTenant(input: SuspendTenantInput): Promise<SuspendTenantResult> {
  const db = getDb();

  const [tenant] = await db
    .select({
      id: tenants.id,
      slug: tenants.slug,
      status: tenants.status,
    })
    .from(tenants)
    .where(eq(tenants.id, input.tenantId))
    .limit(1);

  if (!tenant) {
    throw new SuspendTenantError("not_found");
  }

  const blockReason = getSuspendTenantBlockReason(tenant.status);

  if (blockReason) {
    throw new SuspendTenantError(blockReason);
  }

  const [updated] = await db
    .update(tenants)
    .set({
      status: "suspended",
      updatedAt: new Date(),
    })
    .where(eq(tenants.id, input.tenantId))
    .returning({
      id: tenants.id,
      slug: tenants.slug,
      status: tenants.status,
    });

  rootLogger.info(
    {
      event: "EVT-TenantSuspended",
      tenantId: updated.id,
      slug: updated.slug,
      reason: input.reason?.trim() || undefined,
      suspendedByUserId: input.suspendedByUserId,
    },
    "Tenant suspended",
  );

  return {
    tenantId: updated.id,
    slug: updated.slug,
    status: updated.status,
  };
}
