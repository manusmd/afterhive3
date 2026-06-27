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
