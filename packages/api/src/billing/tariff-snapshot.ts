export type FixedMonthlyTariffConfig = {
  amount_cents: number;
  billing_day: number;
};

export type TariffSnapshot = {
  id: string;
  name: string;
  model: "fixed_monthly" | "per_session" | "package" | "season" | "custom";
  config: FixedMonthlyTariffConfig | Record<string, unknown>;
  vat_rate: string;
};

export type PerSessionTariffConfig = {
  amount_cents: number;
  bill_absent: boolean;
};

export type PackageTariffConfig = {
  amount_cents: number;
  sessions_included: number;
  valid_days: number;
};

export type SeasonTariffConfig = {
  amount_cents: number;
  season_id: string;
  season_start: string;
  season_end: string;
};

export type CustomTariffConfig = {
  description: string;
  billing_day?: number;
};

export function parsePerSessionConfig(config: unknown): PerSessionTariffConfig | null {
  if (!config || typeof config !== "object") {
    return null;
  }

  const record = config as Record<string, unknown>;
  const amountCents = record.amount_cents;
  const billAbsent = record.bill_absent;

  if (
    typeof amountCents !== "number" ||
    !Number.isInteger(amountCents) ||
    amountCents < 0 ||
    typeof billAbsent !== "boolean"
  ) {
    return null;
  }

  return { amount_cents: amountCents, bill_absent: billAbsent };
}

export function shouldBillAttendanceStatus(
  status: "present" | "absent" | "excused" | "late",
  billAbsent: boolean,
) {
  if (status === "absent") {
    return false;
  }

  if (status === "excused") {
    return billAbsent;
  }

  return status === "present" || status === "late";
}

export function parseFixedMonthlyConfig(config: unknown): FixedMonthlyTariffConfig | null {
  if (!config || typeof config !== "object") {
    return null;
  }

  const record = config as Record<string, unknown>;
  const amountCents = record.amount_cents;
  const billingDay = record.billing_day;

  if (
    typeof amountCents !== "number" ||
    !Number.isInteger(amountCents) ||
    amountCents < 0 ||
    typeof billingDay !== "number" ||
    !Number.isInteger(billingDay) ||
    billingDay < 1 ||
    billingDay > 28
  ) {
    return null;
  }

  return { amount_cents: amountCents, billing_day: billingDay };
}

export function parsePackageConfig(config: unknown): PackageTariffConfig | null {
  if (!config || typeof config !== "object") {
    return null;
  }

  const record = config as Record<string, unknown>;
  const amountCents = record.amount_cents;
  const sessionsIncluded = record.sessions_included;
  const validDays = record.valid_days;

  if (
    typeof amountCents !== "number" ||
    !Number.isInteger(amountCents) ||
    amountCents < 0 ||
    typeof sessionsIncluded !== "number" ||
    !Number.isInteger(sessionsIncluded) ||
    sessionsIncluded <= 0 ||
    typeof validDays !== "number" ||
    !Number.isInteger(validDays) ||
    validDays <= 0
  ) {
    return null;
  }

  return {
    amount_cents: amountCents,
    sessions_included: sessionsIncluded,
    valid_days: validDays,
  };
}

export function parseSeasonConfig(config: unknown): SeasonTariffConfig | null {
  if (!config || typeof config !== "object") {
    return null;
  }

  const record = config as Record<string, unknown>;
  const amountCents = record.amount_cents;
  const seasonId = record.season_id;
  const seasonStart = record.season_start;
  const seasonEnd = record.season_end;

  if (
    typeof amountCents !== "number" ||
    !Number.isInteger(amountCents) ||
    amountCents < 0 ||
    typeof seasonId !== "string" ||
    seasonId.length === 0 ||
    typeof seasonStart !== "string" ||
    typeof seasonEnd !== "string" ||
    seasonStart > seasonEnd
  ) {
    return null;
  }

  return {
    amount_cents: amountCents,
    season_id: seasonId,
    season_start: seasonStart,
    season_end: seasonEnd,
  };
}

export function parseCustomConfig(config: unknown): CustomTariffConfig | null {
  if (!config || typeof config !== "object") {
    return null;
  }

  const record = config as Record<string, unknown>;
  const description = record.description;
  const billingDay = record.billing_day;

  if (typeof description !== "string" || description.length === 0) {
    return null;
  }

  if (
    billingDay !== undefined &&
    (typeof billingDay !== "number" ||
      !Number.isInteger(billingDay) ||
      billingDay < 1 ||
      billingDay > 28)
  ) {
    return null;
  }

  return {
    description,
    billing_day: billingDay,
  };
}

export function parseTariffSnapshot(value: unknown): TariffSnapshot | null {
  if (!value || typeof value !== "object") {
    return null;
  }

  const record = value as Record<string, unknown>;

  if (
    typeof record.id !== "string" ||
    typeof record.name !== "string" ||
    typeof record.model !== "string" ||
    typeof record.vat_rate !== "string"
  ) {
    return null;
  }

  return {
    id: record.id,
    name: record.name,
    model: record.model as TariffSnapshot["model"],
    config: (record.config ?? {}) as TariffSnapshot["config"],
    vat_rate: record.vat_rate,
  };
}
