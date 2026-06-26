import { eq } from "drizzle-orm";
import { getDb } from "@afterhive/db";
import { locations, tenantSubscriptions, tenants } from "@afterhive/db/schema";
import { rootLogger } from "@afterhive/shared/logger";
import { InviteStaffError, inviteStaff } from "../auth/invite-staff";
import { createStripeCustomerStub } from "./stripe-customer";

const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export type CreateTenantInput = {
  name: string;
  slug: string;
  legalName?: string;
  ownerEmail: string;
  planId?: string;
  createdByUserId: string;
};

export type CreateTenantResult = {
  tenantId: string;
  slug: string;
  stripeCustomerId: string;
  ownerInviteId: string;
};

export class CreateTenantError extends Error {
  constructor(
    readonly code: "invalid_slug" | "slug_taken" | "owner_invite_failed",
  ) {
    super(code);
    this.name = "CreateTenantError";
  }
}

function normalizeSlug(slug: string) {
  return slug.trim().toLowerCase();
}

function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

export async function createTenant(input: CreateTenantInput): Promise<CreateTenantResult> {
  const db = getDb();
  const slug = normalizeSlug(input.slug);
  const ownerEmail = normalizeEmail(input.ownerEmail);
  const legalName = input.legalName?.trim() || input.name.trim();
  const planId = input.planId ?? "starter";

  if (!SLUG_PATTERN.test(slug) || slug.length < 3 || slug.length > 48) {
    throw new CreateTenantError("invalid_slug");
  }

  const [existingTenant] = await db
    .select({ id: tenants.id })
    .from(tenants)
    .where(eq(tenants.slug, slug))
    .limit(1);

  if (existingTenant) {
    throw new CreateTenantError("slug_taken");
  }

  const [tenant] = await db
    .insert(tenants)
    .values({
      slug,
      name: input.name.trim(),
      legalName,
      status: "trial",
      modules: ["crm", "scheduling", "billing"],
    })
    .returning({ id: tenants.id, slug: tenants.slug });

  await db.insert(locations).values({
    tenantId: tenant.id,
    name: "Hauptstandort",
  });

  const stripeCustomerId = await createStripeCustomerStub({
    tenantId: tenant.id,
    tenantName: input.name.trim(),
    ownerEmail,
  });

  await db.insert(tenantSubscriptions).values({
    tenantId: tenant.id,
    stripeCustomerId,
    planId,
    status: "trialing",
    modulesEntitled: ["crm", "scheduling", "billing"],
  });

  let ownerInviteId: string;

  try {
    const invite = await inviteStaff({
      tenantSlug: tenant.slug,
      email: ownerEmail,
      role: "tenant_owner",
      invitedByUserId: input.createdByUserId,
    });
    ownerInviteId = invite.inviteId;
  } catch (error) {
    if (error instanceof InviteStaffError) {
      throw new CreateTenantError("owner_invite_failed");
    }
    throw error;
  }

  rootLogger.info(
    {
      event: "EVT-TenantCreated",
      tenantId: tenant.id,
      slug: tenant.slug,
      ownerEmail,
      stripeCustomerId,
    },
    "Tenant created",
  );

  return {
    tenantId: tenant.id,
    slug: tenant.slug,
    stripeCustomerId,
    ownerInviteId,
  };
}
