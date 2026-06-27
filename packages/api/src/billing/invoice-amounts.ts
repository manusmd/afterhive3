export function calculateAmountsFromNet(netCents: number, vatRate: number) {
  const vatCents = Math.round(netCents * vatRate);
  return {
    netCents,
    vatCents,
    grossCents: netCents + vatCents,
  };
}

export function parseVatRate(value: string) {
  const parsed = Number(value);

  if (!Number.isFinite(parsed) || parsed < 0) {
    return null;
  }

  return parsed;
}

export function formatServicePeriodLabel(year: number, month: number) {
  const monthLabel = String(month).padStart(2, "0");
  return `${year}-${monthLabel}`;
}

export function getCalendarMonthBounds(year: number, month: number) {
  const servicePeriodStart = `${year}-${String(month).padStart(2, "0")}-01`;
  const lastDay = new Date(Date.UTC(year, month, 0)).getUTCDate();
  const servicePeriodEnd = `${year}-${String(month).padStart(2, "0")}-${String(lastDay).padStart(2, "0")}`;
  return { servicePeriodStart, servicePeriodEnd };
}

export function resolveIssueDate(year: number, month: number, billingDay: number) {
  const lastDay = new Date(Date.UTC(year, month, 0)).getUTCDate();
  const day = Math.min(billingDay, lastDay);
  return `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

export function addDays(isoDate: string, days: number) {
  const date = new Date(`${isoDate}T00:00:00.000Z`);
  date.setUTCDate(date.getUTCDate() + days);
  return date.toISOString().slice(0, 10);
}

export function isContractActiveForPeriod(
  startDate: string,
  endDate: string | null,
  servicePeriodStart: string,
  servicePeriodEnd: string,
) {
  if (startDate > servicePeriodEnd) {
    return false;
  }

  if (endDate && endDate < servicePeriodStart) {
    return false;
  }

  return true;
}
