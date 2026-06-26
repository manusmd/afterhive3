import { getAdminAuth } from "@afterhive/api/auth/admin-auth";
import { getPlatformAuth } from "@afterhive/api/auth/platform-auth";
import { getDb } from "@afterhive/db";
import {
  account,
  leads,
  locations,
  platformMemberships,
  roleAssignments,
  session,
  staffInvites,
  tenantMemberships,
  tenantSubscriptions,
  tenants,
  user,
} from "@afterhive/db/schema";

async function main() {
  const db = getDb();
  const adminAuth = getAdminAuth();
  const platformAuth = getPlatformAuth();

  await db.delete(roleAssignments);
  await db.delete(staffInvites);
  await db.delete(leads);
  await db.delete(tenantMemberships);
  await db.delete(tenantSubscriptions);
  await db.delete(platformMemberships);
  await db.delete(locations);
  await db.delete(tenants);
  await db.delete(session);
  await db.delete(account);
  await db.delete(user);

  const platformSignUp = await platformAuth.api.signUpEmail({
    body: {
      email: "platform@afterhive.de",
      password: "Platform1234!",
      name: "Platform Admin",
    },
  });

  if (!platformSignUp.user) {
    throw new Error("Failed to seed platform admin");
  }

  await db.insert(platformMemberships).values({
    userId: platformSignUp.user.id,
    role: "platform_superadmin",
    status: "active",
  });

  const [tenant] = await db
    .insert(tenants)
    .values({
      slug: "demo-club",
      name: "Demo Sportverein",
      legalName: "Demo Sportverein e.V.",
      status: "active",
    })
    .returning();

  await db.insert(tenantSubscriptions).values({
    tenantId: tenant.id,
    stripeCustomerId: "cus_dev_demo_club",
    planId: "starter",
    status: "active",
    modulesEntitled: ["crm", "scheduling", "billing"],
  });

  const [locationA, locationB] = await db
    .insert(locations)
    .values([
      { tenantId: tenant.id, name: "Standort Nord" },
      { tenantId: tenant.id, name: "Standort Sued" },
    ])
    .returning();

  const staffSignUp = await adminAuth.api.signUpEmail({
    body: {
      email: "staff@demo-club.de",
      password: "Demo1234!",
      name: "Demo Staff",
    },
  });

  if (!staffSignUp.user) {
    throw new Error("Failed to seed staff user");
  }

  const [staffMembership] = await db
    .insert(tenantMemberships)
    .values({
      tenantId: tenant.id,
      userId: staffSignUp.user.id,
      status: "active",
      acceptedAt: new Date(),
    })
    .returning();

  await db.insert(roleAssignments).values({
    tenantId: tenant.id,
    membershipId: staffMembership.id,
    role: "tenant_office",
    locationIds: [locationA.id],
  });

  const ownerSignUp = await adminAuth.api.signUpEmail({
    body: {
      email: "owner@demo-club.de",
      password: "Demo1234!",
      name: "Demo Owner",
    },
  });

  if (ownerSignUp.user) {
    const [ownerMembership] = await db
      .insert(tenantMemberships)
      .values({
        tenantId: tenant.id,
        userId: ownerSignUp.user.id,
        status: "active",
        acceptedAt: new Date(),
      })
      .returning();

    await db.insert(roleAssignments).values({
      tenantId: tenant.id,
      membershipId: ownerMembership.id,
      role: "tenant_owner",
      locationIds: [],
    });
  }

  await db.insert(leads).values([
    {
      tenantId: tenant.id,
      locationId: locationA.id,
      firstName: "Anna",
      lastName: "Nord",
      status: "new",
      source: "manual",
    },
    {
      tenantId: tenant.id,
      locationId: locationB.id,
      firstName: "Ben",
      lastName: "Sued",
      status: "new",
      source: "manual",
    },
  ]);

  console.log("Platform: platform@afterhive.de / Platform1234!");
  console.log("Seeded demo tenant:", tenant.slug);
  console.log("Staff: staff@demo-club.de / Demo1234! → location", locationA.name, "(1 lead)");
  console.log("Owner: owner@demo-club.de / Demo1234! → all locations (2 leads)");
  console.log("Other location:", locationB.name);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
