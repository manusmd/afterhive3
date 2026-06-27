import { countInclusiveDays } from "./invoice-amounts";
import type { CustomTariffConfig } from "./tariff-snapshot";

export function resolvePackageNetCents(amountCents: number) {
  return amountCents;
}

export function resolveSeasonNetCents(
  amountCents: number,
  seasonStart: string,
  seasonEnd: string,
  billingStart: string,
) {
  if (billingStart <= seasonStart) {
    return amountCents;
  }

  if (billingStart > seasonEnd) {
    return 0;
  }

  const seasonDays = countInclusiveDays(seasonStart, seasonEnd);
  const daysRemaining = countInclusiveDays(billingStart, seasonEnd);

  if (seasonDays === 0) {
    return 0;
  }

  return Math.round((daysRemaining / seasonDays) * amountCents);
}

export function resolveCustomNetCents(customAmountCents: number | null | undefined) {
  if (
    customAmountCents === null ||
    customAmountCents === undefined ||
    !Number.isInteger(customAmountCents) ||
    customAmountCents < 0
  ) {
    return null;
  }

  return customAmountCents;
}

export function resolveCustomBillingDay(config: CustomTariffConfig) {
  return config.billing_day ?? 1;
}

export function buildPackageDescription(tariffName: string, sessionsIncluded: number) {
  return `${tariffName} (${sessionsIncluded} sessions)`;
}

export function buildSeasonDescription(tariffName: string, seasonStart: string, seasonEnd: string) {
  return `${tariffName} ${seasonStart}/${seasonEnd}`;
}
