const BYDAY_TO_JS_DAY: Record<string, number> = {
  SU: 0,
  MO: 1,
  TU: 2,
  WE: 3,
  TH: 4,
  FR: 5,
  SA: 6,
};

export function isValidWeeklySingleDayRrule(rrule: string): boolean {
  const parts = rrule.split(";").map((part) => part.trim()).filter(Boolean);
  if (parts.length !== 2) {
    return false;
  }

  let hasWeekly = false;
  let byday: string | null = null;

  for (const part of parts) {
    const separatorIndex = part.indexOf("=");
    if (separatorIndex === -1) {
      return false;
    }

    const key = part.slice(0, separatorIndex);
    const value = part.slice(separatorIndex + 1);

    if (key === "FREQ") {
      if (value !== "WEEKLY") {
        return false;
      }
      hasWeekly = true;
    } else if (key === "BYDAY") {
      if (byday !== null) {
        return false;
      }

      const days = value.split(",").filter((day) => day.length > 0);
      if (days.length !== 1 || BYDAY_TO_JS_DAY[days[0]] === undefined) {
        return false;
      }

      byday = days[0];
    } else {
      return false;
    }
  }

  return hasWeekly && byday !== null;
}

export function parseWeeklyByDay(rrule: string): number | null {
  if (!isValidWeeklySingleDayRrule(rrule)) {
    return null;
  }

  const match = rrule.match(/BYDAY=([A-Z]{2})/);
  if (!match) {
    return null;
  }

  return BYDAY_TO_JS_DAY[match[1]] ?? null;
}

export type WeeklySessionOccurrence = {
  startsAt: Date;
  endsAt: Date;
};

export function buildWeeklySessionOccurrences(input: {
  dtstart: Date;
  durationMinutes: number;
  rrule: string;
  maxOccurrences: number;
}): WeeklySessionOccurrence[] {
  const targetDay = parseWeeklyByDay(input.rrule);
  if (targetDay === null || input.maxOccurrences < 1) {
    return [];
  }

  const occurrences: WeeklySessionOccurrence[] = [];
  const cursor = new Date(input.dtstart);

  while (cursor.getUTCDay() !== targetDay) {
    cursor.setUTCDate(cursor.getUTCDate() + 1);
  }

  while (occurrences.length < input.maxOccurrences) {
    const startsAt = new Date(cursor);
    const endsAt = new Date(startsAt.getTime() + input.durationMinutes * 60_000);

    if (startsAt >= input.dtstart) {
      occurrences.push({ startsAt, endsAt });
    }

    cursor.setUTCDate(cursor.getUTCDate() + 7);
  }

  return occurrences;
}
