const MINOR_AGE_YEARS = 18;

export function isMinorAtDate(dateOfBirth: Date, referenceDate: Date) {
  const birthYear = dateOfBirth.getUTCFullYear();
  const birthMonth = dateOfBirth.getUTCMonth();
  const birthDay = dateOfBirth.getUTCDate();

  let age = referenceDate.getUTCFullYear() - birthYear;
  const monthDiff = referenceDate.getUTCMonth() - birthMonth;
  const dayDiff = referenceDate.getUTCDate() - birthDay;

  if (monthDiff < 0 || (monthDiff === 0 && dayDiff < 0)) {
    age -= 1;
  }

  return age < MINOR_AGE_YEARS;
}

export function resolveInitialConsentStatus(dateOfBirth: Date | null, referenceDate: Date) {
  if (!dateOfBirth) {
    return "complete" as const;
  }

  return isMinorAtDate(dateOfBirth, referenceDate) ? ("pending" as const) : ("complete" as const);
}
