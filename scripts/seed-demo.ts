import { eq } from "drizzle-orm";
import { getAdminAuth } from "@afterhive/api/auth/admin-auth";
import { getDb } from "@afterhive/db";
import {
  account,
  locations,
  roleAssignments,
  session,
  tenantMemberships,
  tenants,
  user,
} from "@afterhive/db/schema";

async function main() {
  const db = getDb();
  const auth = getAdminAuth();

  await db.delete(roleAssignments);
  await db.delete(tenantMemberships);
  await db.delete(locations);
  await db.delete(tenants);
  await db.delete(session);
  await db.delete(account);
  await db.delete(user);

  const [tenant] = await db
    .insert(tenants)
    .values({
      slug: "demo-club",
      name: "Demo Sportverein",
      legalName: "Demo Sportverein e.V.",
      status: "active",
    })
    .returning();

  const [locationA, locationB] = await db
    .insert(locations)
    .values([
      { tenantId: tenant.id, name: "Standort Nord" },
      { tenantId: tenant.id, name: "Standort Sued" },
    ])
    .returning();

  const staffSignUp = await auth.api.signUpEmail({
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
    role: "office_staff",
    locationIds: [locationA.id],
  });

  const ownerSignUp = await auth.api.signUpEmail({
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

  console.log("Seeded demo tenant:", tenant.slug);
  console.log("Staff: staff@demo-club.de / Demo1234! → location", locationA.name);
  console.log("Owner: owner@demo-club.de / Demo1234! → all locations");
  console.log("Other location:", locationB.name);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
