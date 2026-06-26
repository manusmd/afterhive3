import { and, eq, isNull, or } from "drizzle-orm";
import { getDb } from "@afterhive/db";
import {
  auditLogEntries,
  consentRecords,
  leads,
  memberProfiles,
  persons,
  relationships,
  tenants,
} from "@afterhive/db/schema";
import type { SessionContext } from "@afterhive/domain";
import {
  buildLocationScopeFilter,
  hasAllLocationsAccess,
  hasNoLocationAccess,
} from "../location/location-scope";
import { buildPersonExportZip, type PersonExportCategories } from "./build-export-zip";
import { resolveSessionExportLocationIds } from "./can-export-person";

export type ExportPersonResult = {
  fileName: string;
  zip: Uint8Array;
  categories: PersonExportCategories;
};

export class ExportPersonError extends Error {
  constructor(
    readonly code: "tenant_not_found" | "person_not_found" | "location_forbidden",
  ) {
    super(code);
    this.name = "ExportPersonError";
  }
}

async function assertPersonExportScope(
  tenantId: string,
  personId: string,
  exportLocationIds: string[] | undefined,
) {
  if (hasAllLocationsAccess(exportLocationIds)) {
    return;
  }

  if (hasNoLocationAccess(exportLocationIds)) {
    throw new ExportPersonError("location_forbidden");
  }

  const db = getDb();
  const scopeFilter = buildLocationScopeFilter(leads.locationId, exportLocationIds);
  const conditions = [
    eq(leads.tenantId, tenantId),
    eq(leads.convertedPersonId, personId),
  ];

  if (scopeFilter) {
    conditions.push(scopeFilter);
  }

  const [lead] = await db
    .select({ id: leads.id })
    .from(leads)
    .where(and(...conditions))
    .limit(1);

  if (!lead) {
    throw new ExportPersonError("location_forbidden");
  }
}

export async function collectPersonExportCategories(
  tenantId: string,
  personId: string,
  exportLocationIds?: string[],
): Promise<PersonExportCategories> {
  const db = getDb();

  const [profile] = await db
    .select({
      id: persons.id,
      firstName: persons.firstName,
      lastName: persons.lastName,
      dateOfBirth: persons.dateOfBirth,
      createdAt: persons.createdAt,
    })
    .from(persons)
    .where(and(eq(persons.tenantId, tenantId), eq(persons.id, personId), isNull(persons.deletedAt)))
    .limit(1);

  if (!profile) {
    throw new ExportPersonError("person_not_found");
  }

  const [member] = await db
    .select({
      id: memberProfiles.id,
      memberNumber: memberProfiles.memberNumber,
      status: memberProfiles.status,
      consentStatus: memberProfiles.consentStatus,
      createdAt: memberProfiles.createdAt,
    })
    .from(memberProfiles)
    .where(and(eq(memberProfiles.tenantId, tenantId), eq(memberProfiles.personId, personId)))
    .limit(1);

  const consent = await db
    .select({
      id: consentRecords.id,
      type: consentRecords.type,
      granted: consentRecords.granted,
      grantedAt: consentRecords.grantedAt,
      method: consentRecords.method,
      guardianPersonId: consentRecords.guardianPersonId,
    })
    .from(consentRecords)
    .where(and(eq(consentRecords.tenantId, tenantId), eq(consentRecords.personId, personId)));

  const relationshipRows = await db
    .select({
      id: relationships.id,
      fromPersonId: relationships.fromPersonId,
      toPersonId: relationships.toPersonId,
      type: relationships.type,
      isPrimaryGuardian: relationships.isPrimaryGuardian,
    })
    .from(relationships)
    .where(
      and(
        eq(relationships.tenantId, tenantId),
        or(eq(relationships.fromPersonId, personId), eq(relationships.toPersonId, personId)),
      ),
    );

  const leadConditions = [eq(leads.tenantId, tenantId), eq(leads.convertedPersonId, personId)];
  const leadScopeFilter = buildLocationScopeFilter(leads.locationId, exportLocationIds);

  if (leadScopeFilter) {
    leadConditions.push(leadScopeFilter);
  }

  const leadRows = await db
    .select({
      id: leads.id,
      firstName: leads.firstName,
      lastName: leads.lastName,
      status: leads.status,
      source: leads.source,
      locationId: leads.locationId,
      convertedAt: leads.convertedAt,
      createdAt: leads.createdAt,
    })
    .from(leads)
    .where(and(...leadConditions));

  return {
    profile: {
      ...profile,
      createdAt: profile.createdAt.toISOString(),
      dateOfBirth: profile.dateOfBirth ?? null,
    },
    member: member
      ? {
          ...member,
          createdAt: member.createdAt.toISOString(),
        }
      : null,
    consent: consent.map((entry) => ({
      ...entry,
      grantedAt: entry.grantedAt.toISOString(),
    })),
    relationships: relationshipRows,
    leads: leadRows.map((entry) => ({
      ...entry,
      convertedAt: entry.convertedAt?.toISOString() ?? null,
      createdAt: entry.createdAt.toISOString(),
    })),
  };
}

export async function exportPerson(
  session: SessionContext,
  tenantSlug: string,
  personId: string,
): Promise<ExportPersonResult> {
  if (!session.tenantId || !session.userId) {
    throw new ExportPersonError("tenant_not_found");
  }

  const db = getDb();
  const [person] = await db
    .select({ id: persons.id, firstName: persons.firstName, lastName: persons.lastName })
    .from(persons)
    .innerJoin(tenants, eq(persons.tenantId, tenants.id))
    .where(
      and(
        eq(persons.id, personId),
        eq(persons.tenantId, session.tenantId),
        eq(tenants.slug, tenantSlug),
        isNull(persons.deletedAt),
      ),
    )
    .limit(1);

  if (!person) {
    throw new ExportPersonError("person_not_found");
  }

  const exportLocationIds = resolveSessionExportLocationIds(session);

  await assertPersonExportScope(session.tenantId, personId, exportLocationIds);

  const categories = await collectPersonExportCategories(
    session.tenantId,
    personId,
    exportLocationIds,
  );
  const zip = buildPersonExportZip(categories);
  const fileName = `person-export-${personId}.zip`;

  await db.insert(auditLogEntries).values({
    tenantId: session.tenantId,
    actorUserId: session.userId,
    action: "gdpr.export",
    entityType: "person",
    entityId: personId,
    after: {
      fileName,
      categories: Object.keys(categories),
    },
  });

  return { fileName, zip, categories };
}
