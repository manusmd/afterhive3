import { eq } from "drizzle-orm";
import { getDb } from "@afterhive/db";
import { importJobs, leads, type ImportJobResult } from "@afterhive/db/schema";
import type { SessionContext } from "@afterhive/domain";
import { getMappedValue, parseCsv } from "@afterhive/shared/csv-parse";
import { listTenantLocations } from "../auth/tenant-locations";
import { isWithinLocationScope } from "../location/location-scope";
import { resolveImportLocationIds } from "./can-run-import";
import { normalizeLeadName } from "./create-lead";

export type LeadImportMapping = {
  firstName: string;
  lastName: string;
  source?: string;
  locationCode?: string;
};

export type ImportLeadsCsvInput = {
  csvContent: string;
  mapping: LeadImportMapping;
  defaultLocationId?: string;
  fileName?: string;
};

export type ImportLeadsCsvResult = {
  jobId: string;
  status: "completed" | "failed";
  result: ImportJobResult;
};

export class ImportLeadsCsvError extends Error {
  constructor(
    readonly code:
      | "tenant_not_found"
      | "invalid_csv"
      | "invalid_mapping"
      | "invalid_location"
      | "location_forbidden"
      | "too_many_rows",
  ) {
    super(code);
    this.name = "ImportLeadsCsvError";
  }
}

const MAX_ROWS = 500;
const ALLOWED_SOURCES = new Set(["manual", "web", "marketplace", "import", "phone"]);
const DEFAULT_SOURCE = "import";

export function validateLeadImportMapping(mapping: LeadImportMapping) {
  if (!mapping.firstName?.trim() || !mapping.lastName?.trim()) {
    return { ok: false as const, code: "invalid_mapping" as const };
  }

  return { ok: true as const };
}

function normalizeLocationCode(value: string) {
  return value.trim().toLowerCase();
}

export async function importLeadsCsv(
  session: SessionContext,
  tenantSlug: string,
  input: ImportLeadsCsvInput,
): Promise<ImportLeadsCsvResult> {
  if (!session.tenantId || !session.userId) {
    throw new ImportLeadsCsvError("tenant_not_found");
  }

  const mappingValidation = validateLeadImportMapping(input.mapping);
  if (!mappingValidation.ok) {
    throw new ImportLeadsCsvError(mappingValidation.code);
  }

  if (!input.csvContent.trim()) {
    throw new ImportLeadsCsvError("invalid_csv");
  }

  const parsed = parseCsv(input.csvContent);
  if (parsed.rows.length === 0) {
    throw new ImportLeadsCsvError("invalid_csv");
  }

  if (parsed.rows.length > MAX_ROWS) {
    throw new ImportLeadsCsvError("too_many_rows");
  }

  const importLocationIds = session.roleAssignments
    ? resolveImportLocationIds(session.roles, session.roleAssignments)
    : session.locationIds;

  const tenantLocations = await listTenantLocations(tenantSlug);
  const locationByCode = new Map(
    tenantLocations.map((location) => [normalizeLocationCode(location.name), location.id]),
  );

  const db = getDb();
  const [job] = await db
    .insert(importJobs)
    .values({
      tenantId: session.tenantId,
      entityType: "lead",
      status: "processing",
      fileName: input.fileName,
      mapping: input.mapping,
      createdByUserId: session.userId,
    })
    .returning({ id: importJobs.id });

  const result: ImportJobResult = {
    imported: 0,
    failed: 0,
    errors: [],
  };

  for (let index = 0; index < parsed.rows.length; index += 1) {
    const rowNumber = index + 2;
    const row = parsed.rows[index];
    const firstName = normalizeLeadName(getMappedValue(row, input.mapping.firstName));
    const lastName = normalizeLeadName(getMappedValue(row, input.mapping.lastName));

    if (!firstName || !lastName) {
      result.failed += 1;
      result.errors.push({ row: rowNumber, message: "missing_required_fields" });
      continue;
    }

    const locationCode = getMappedValue(row, input.mapping.locationCode);
    const locationId = locationCode
      ? locationByCode.get(normalizeLocationCode(locationCode))
      : input.defaultLocationId;

    if (!locationId) {
      result.failed += 1;
      result.errors.push({ row: rowNumber, message: "invalid_location" });
      continue;
    }

    if (!isWithinLocationScope(locationId, importLocationIds)) {
      result.failed += 1;
      result.errors.push({ row: rowNumber, message: "location_forbidden" });
      continue;
    }

    const rawSource = getMappedValue(row, input.mapping.source);
    const source = rawSource && ALLOWED_SOURCES.has(rawSource) ? rawSource : DEFAULT_SOURCE;

    try {
      await db.insert(leads).values({
        tenantId: session.tenantId,
        locationId,
        firstName,
        lastName,
        status: "new",
        source,
      });
      result.imported += 1;
    } catch {
      result.failed += 1;
      result.errors.push({ row: rowNumber, message: "insert_failed" });
    }
  }

  const status = result.imported > 0 || result.failed > 0 ? "completed" : "failed";

  await db
    .update(importJobs)
    .set({
      status,
      result,
      completedAt: new Date(),
    })
    .where(eq(importJobs.id, job.id));

  return {
    jobId: job.id,
    status,
    result,
  };
}
