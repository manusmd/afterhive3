import { getAdminAuth } from "@afterhive/api/auth/admin-auth";
import { getPlatformAuth } from "@afterhive/api/auth/platform-auth";
import { getPortalAuth } from "@afterhive/api/auth/portal-auth";
import { getDb } from "@afterhive/db";
import {
  account,
  consentRecords,
  documents,
  enrollments,
  leads,
  locations,
  memberProfiles,
  offerGroups,
  offers,
  persons,
  platformMemberships,
  recurrenceRules,
  relationships,
  roleAssignments,
  session,
  sessions,
  staffInvites,
  tenantMemberships,
  tenantSubscriptions,
  tenants,
  waitlistEntries,
  user,
} from "@afterhive/db/schema";

async function main() {
  const db = getDb();
  const adminAuth = getAdminAuth();
  const platformAuth = getPlatformAuth();
  const portalAuth = getPortalAuth();

  await db.delete(consentRecords);
  await db.delete(documents);
  await db.delete(waitlistEntries);
  await db.delete(enrollments);
  await db.delete(sessions);
  await db.delete(recurrenceRules);
  await db.delete(offerGroups);
  await db.delete(offers);
  await db.delete(relationships);
  await db.delete(memberProfiles);
  await db.delete(roleAssignments);
  await db.delete(staffInvites);
  await db.delete(leads);
  await db.delete(persons);
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
      status: "qualified",
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

  const guardianSignUp = await portalAuth.api.signUpEmail({
    body: {
      email: "guardian@demo-club.de",
      password: "Demo1234!",
      name: "Demo Guardian",
    },
  });

  if (!guardianSignUp.user) {
    throw new Error("Failed to seed guardian user");
  }

  const [guardianPerson, minorPerson] = await db
    .insert(persons)
    .values([
      {
        tenantId: tenant.id,
        userId: guardianSignUp.user.id,
        firstName: "Maria",
        lastName: "Muster",
      },
      {
        tenantId: tenant.id,
        firstName: "Leo",
        lastName: "Muster",
        dateOfBirth: "2015-03-15",
      },
    ])
    .returning();

  await db.insert(relationships).values({
    tenantId: tenant.id,
    fromPersonId: guardianPerson.id,
    toPersonId: minorPerson.id,
    type: "guardian",
    isPrimaryGuardian: true,
  });

  await db.insert(memberProfiles).values({
    tenantId: tenant.id,
    personId: minorPerson.id,
    memberNumber: "M-0001",
    consentStatus: "pending",
  });

  if (ownerSignUp.user) {
    await db.insert(documents).values([
      {
        tenantId: tenant.id,
        storageKey: `${tenant.id}/documents/demo-club-info/club-info.pdf`,
        filename: "club-info.pdf",
        mimeType: "application/pdf",
        sizeBytes: 1024,
        sha256: "demo-club-info-sha256",
        visibility: "portal",
        uploadedByUserId: ownerSignUp.user.id,
      },
      {
        tenantId: tenant.id,
        storageKey: `${tenant.id}/documents/demo-member-doc/member-form.pdf`,
        filename: "member-form.pdf",
        mimeType: "application/pdf",
        sizeBytes: 2048,
        sha256: "demo-member-form-sha256",
        visibility: "both",
        linkedEntityType: "person",
        linkedEntityId: minorPerson.id,
        uploadedByUserId: ownerSignUp.user.id,
      },
      {
        tenantId: tenant.id,
        storageKey: `${tenant.id}/documents/demo-internal/internal-only.pdf`,
        filename: "internal-only.pdf",
        mimeType: "application/pdf",
        sizeBytes: 512,
        sha256: "demo-internal-sha256",
        visibility: "internal",
        uploadedByUserId: ownerSignUp.user.id,
      },
    ]);
  }

  console.log("Platform: platform@afterhive.de / Platform1234!");
  console.log("Seeded demo tenant:", tenant.slug);
  console.log("Staff: staff@demo-club.de / Demo1234! → location", locationA.name, "(1 qualified lead)");
  console.log("Owner: owner@demo-club.de / Demo1234! → all locations (2 leads)");
  console.log("Guardian: guardian@demo-club.de / Demo1234! → portal consent for", minorPerson.firstName);
  console.log("Portal documents: /portal/demo-club/documents (2 visible, 1 internal hidden)");
  console.log("Other location:", locationB.name);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
