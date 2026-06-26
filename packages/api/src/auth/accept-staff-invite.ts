import { and, eq } from "drizzle-orm";
import { getDb } from "@afterhive/db";
import {
  roleAssignments,
  staffInvites,
  tenantMemberships,
  tenants,
  user,
} from "@afterhive/db/schema";
import { getAdminAuth } from "./admin-auth";
import { getStaffInviteByToken } from "./invite-staff";

export type AcceptStaffInviteInput = {
  tenantSlug: string;
  token: string;
  name: string;
  password: string;
};

export type AcceptStaffInviteResult = {
  membershipId: string;
  userId: string;
};

export async function acceptStaffInvite(
  input: AcceptStaffInviteInput,
): Promise<AcceptStaffInviteResult> {
  const invite = await getStaffInviteByToken(input.tenantSlug, input.token);

  if (!invite) {
    throw new AcceptStaffInviteError("invalid_invite");
  }

  const db = getDb();
  const auth = getAdminAuth();

  const [tenant] = await db
    .select({ id: tenants.id })
    .from(tenants)
    .where(eq(tenants.slug, input.tenantSlug))
    .limit(1);

  if (!tenant) {
    throw new AcceptStaffInviteError("invalid_invite");
  }

  const [existingUser] = await db
    .select({ id: user.id })
    .from(user)
    .where(eq(user.email, invite.email))
    .limit(1);

  let userId = existingUser?.id;

  if (!userId) {
    const signUp = await auth.api.signUpEmail({
      body: {
        email: invite.email,
        password: input.password,
        name: input.name.trim(),
      },
    });

    if (!signUp.user) {
      throw new AcceptStaffInviteError("signup_failed");
    }

    userId = signUp.user.id;
  }

  const [existingMembership] = await db
    .select({ id: tenantMemberships.id })
    .from(tenantMemberships)
    .where(
      and(eq(tenantMemberships.tenantId, tenant.id), eq(tenantMemberships.userId, userId)),
    )
    .limit(1);

  if (existingMembership) {
    throw new AcceptStaffInviteError("already_member");
  }

  const acceptedAt = new Date();

  const [membership] = await db
    .insert(tenantMemberships)
    .values({
      tenantId: tenant.id,
      userId,
      status: "active",
      invitedAt: acceptedAt,
      acceptedAt,
    })
    .returning({ id: tenantMemberships.id });

  await db.insert(roleAssignments).values({
    tenantId: tenant.id,
    membershipId: membership.id,
    role: invite.role,
    locationIds: invite.locationIds,
  });

  await db
    .update(staffInvites)
    .set({ acceptedAt })
    .where(eq(staffInvites.id, invite.id));

  return {
    membershipId: membership.id,
    userId,
  };
}

export class AcceptStaffInviteError extends Error {
  constructor(
    readonly code: "invalid_invite" | "signup_failed" | "already_member",
  ) {
    super(code);
    this.name = "AcceptStaffInviteError";
  }
}
