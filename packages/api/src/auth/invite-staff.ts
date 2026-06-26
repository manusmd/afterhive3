import { randomBytes } from "node:crypto";
import { and, asc, eq, gt, isNull } from "drizzle-orm";
import { getDb } from "@afterhive/db";
import {
  staffInvites,
  tenantMemberships,
  tenants,
  user,
} from "@afterhive/db/schema";
import { sendStaffInviteEmail } from "../email/send-staff-invite";

const INVITE_TTL_MS = 7 * 24 * 60 * 60 * 1000;

export type InviteStaffInput = {
  tenantSlug: string;
  email: string;
  role: string;
  locationIds?: string[];
  invitedByUserId: string;
};

export type InviteStaffResult = {
  inviteId: string;
  emailSent: true;
};

function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

function createInviteToken() {
  return randomBytes(32).toString("hex");
}

export async function inviteStaff(input: InviteStaffInput): Promise<InviteStaffResult> {
  const db = getDb();
  const email = normalizeEmail(input.email);

  const [tenant] = await db
    .select({ id: tenants.id, slug: tenants.slug })
    .from(tenants)
    .where(eq(tenants.slug, input.tenantSlug))
    .limit(1);

  if (!tenant) {
    throw new InviteStaffError("tenant_not_found");
  }

  const [existingUser] = await db
    .select({ id: user.id })
    .from(user)
    .where(eq(user.email, email))
    .limit(1);

  if (existingUser) {
    const [existingMembership] = await db
      .select({ id: tenantMemberships.id })
      .from(tenantMemberships)
      .where(
        and(
          eq(tenantMemberships.tenantId, tenant.id),
          eq(tenantMemberships.userId, existingUser.id),
        ),
      )
      .limit(1);

    if (existingMembership) {
      throw new InviteStaffError("already_member");
    }
  }

  const now = new Date();
  const [pendingInvite] = await db
    .select({ id: staffInvites.id })
    .from(staffInvites)
    .where(
      and(
        eq(staffInvites.tenantId, tenant.id),
        eq(staffInvites.email, email),
        isNull(staffInvites.acceptedAt),
        gt(staffInvites.expiresAt, now),
      ),
    )
    .limit(1);

  if (pendingInvite) {
    throw new InviteStaffError("invite_pending");
  }

  const token = createInviteToken();
  const expiresAt = new Date(now.getTime() + INVITE_TTL_MS);

  const [invite] = await db
    .insert(staffInvites)
    .values({
      tenantId: tenant.id,
      email,
      role: input.role,
      locationIds: input.locationIds?.length ? input.locationIds : null,
      token,
      expiresAt,
      invitedByUserId: input.invitedByUserId,
    })
    .returning({ id: staffInvites.id });

  await sendStaffInviteEmail({
    tenantSlug: tenant.slug,
    email,
    token,
  });

  return {
    inviteId: invite.id,
    emailSent: true,
  };
}

export class InviteStaffError extends Error {
  constructor(readonly code: "tenant_not_found" | "already_member" | "invite_pending") {
    super(code);
    this.name = "InviteStaffError";
  }
}

export async function listPendingStaffInvites(tenantSlug: string) {
  const db = getDb();
  const now = new Date();

  return db
    .select({
      id: staffInvites.id,
      email: staffInvites.email,
      role: staffInvites.role,
      locationIds: staffInvites.locationIds,
      expiresAt: staffInvites.expiresAt,
      createdAt: staffInvites.createdAt,
    })
    .from(staffInvites)
    .innerJoin(tenants, eq(staffInvites.tenantId, tenants.id))
    .where(
      and(
        eq(tenants.slug, tenantSlug),
        isNull(staffInvites.acceptedAt),
        gt(staffInvites.expiresAt, now),
      ),
    )
    .orderBy(asc(staffInvites.createdAt));
}

export async function getStaffInviteByToken(tenantSlug: string, token: string) {
  const db = getDb();
  const now = new Date();

  const [invite] = await db
    .select({
      id: staffInvites.id,
      email: staffInvites.email,
      role: staffInvites.role,
      locationIds: staffInvites.locationIds,
      expiresAt: staffInvites.expiresAt,
      acceptedAt: staffInvites.acceptedAt,
      tenantSlug: tenants.slug,
    })
    .from(staffInvites)
    .innerJoin(tenants, eq(staffInvites.tenantId, tenants.id))
    .where(and(eq(tenants.slug, tenantSlug), eq(staffInvites.token, token)))
    .limit(1);

  if (!invite || invite.acceptedAt || invite.expiresAt <= now) {
    return null;
  }

  return invite;
}
