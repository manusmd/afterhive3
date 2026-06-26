import { and, eq, isNull } from "drizzle-orm";
import { getDb } from "@afterhive/db";
import {
  consentRecords,
  memberProfiles,
  persons,
  relationships,
  tenants,
} from "@afterhive/db/schema";
import type { PortalSessionContext } from "../auth/get-portal-session";

export type ConsentType = "enrollment" | "portal";

export type GrantConsentInput = {
  minorPersonId: string;
  type: ConsentType;
};

export type GrantConsentResult = {
  consentId: string;
  personId: string;
  type: ConsentType;
  grantedAt: string;
};

export class GrantConsentError extends Error {
  constructor(
    readonly code:
      | "tenant_not_found"
      | "person_not_found"
      | "not_guardian"
      | "already_granted",
  ) {
    super(code);
    this.name = "GrantConsentError";
  }
}

export async function grantConsent(
  session: PortalSessionContext,
  tenantSlug: string,
  input: GrantConsentInput,
): Promise<GrantConsentResult> {
  if (!session.tenantId) {
    throw new GrantConsentError("tenant_not_found");
  }

  const db = getDb();
  const grantedAt = new Date();

  return db.transaction(async (tx) => {
    const [minor] = await tx
      .select({ id: persons.id })
      .from(persons)
      .innerJoin(tenants, eq(persons.tenantId, tenants.id))
      .where(
        and(
          eq(persons.id, input.minorPersonId),
          eq(persons.tenantId, session.tenantId!),
          eq(tenants.slug, tenantSlug),
          isNull(persons.deletedAt),
        ),
      )
      .limit(1);

    if (!minor) {
      throw new GrantConsentError("person_not_found");
    }

    const [guardianLink] = await tx
      .select({ id: relationships.id })
      .from(relationships)
      .where(
        and(
          eq(relationships.tenantId, session.tenantId!),
          eq(relationships.fromPersonId, session.personId),
          eq(relationships.toPersonId, input.minorPersonId),
          eq(relationships.type, "guardian"),
        ),
      )
      .limit(1);

    if (!guardianLink) {
      throw new GrantConsentError("not_guardian");
    }

    const [existingConsent] = await tx
      .select({ id: consentRecords.id })
      .from(consentRecords)
      .where(
        and(
          eq(consentRecords.tenantId, session.tenantId!),
          eq(consentRecords.personId, input.minorPersonId),
          eq(consentRecords.guardianPersonId, session.personId),
          eq(consentRecords.type, input.type),
          eq(consentRecords.granted, true),
        ),
      )
      .limit(1);

    if (existingConsent) {
      throw new GrantConsentError("already_granted");
    }

    const [record] = await tx
      .insert(consentRecords)
      .values({
        tenantId: session.tenantId!,
        personId: input.minorPersonId,
        guardianPersonId: session.personId,
        type: input.type,
        granted: true,
        grantedAt,
        method: "portal_click",
      })
      .returning({ id: consentRecords.id });

    if (input.type === "enrollment") {
      await tx
        .update(memberProfiles)
        .set({ consentStatus: "complete" })
        .where(
          and(
            eq(memberProfiles.tenantId, session.tenantId!),
            eq(memberProfiles.personId, input.minorPersonId),
          ),
        );
    }

    return {
      consentId: record.id,
      personId: input.minorPersonId,
      type: input.type,
      grantedAt: grantedAt.toISOString(),
    };
  });
}

export type ConsentTarget = {
  personId: string;
  firstName: string;
  lastName: string;
  consentStatus: string;
};

export async function listConsentTargets(
  session: PortalSessionContext,
): Promise<ConsentTarget[]> {
  if (!session.tenantId) {
    return [];
  }

  const db = getDb();
  const rows = await db
    .select({
      personId: persons.id,
      firstName: persons.firstName,
      lastName: persons.lastName,
      consentStatus: memberProfiles.consentStatus,
    })
    .from(relationships)
    .innerJoin(persons, eq(relationships.toPersonId, persons.id))
    .innerJoin(memberProfiles, eq(memberProfiles.personId, persons.id))
    .where(
      and(
        eq(relationships.tenantId, session.tenantId),
        eq(relationships.fromPersonId, session.personId),
        eq(relationships.type, "guardian"),
        isNull(persons.deletedAt),
        eq(memberProfiles.consentStatus, "pending"),
      ),
    );

  return rows;
}
