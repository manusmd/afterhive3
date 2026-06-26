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
  if (!rrule.includes("FREQ=WEEKLY")) {
    return false;
  }

  const match = rrule.match(/BYDAY=([A-Z,]+)/);
  if (!match) {
    return false;
  }

  const days = match[1].split(",").filter((day) => day.length > 0);
  if (days.length !== 1) {
    return false;
  }

  return BYDAY_TO_JS_DAY[days[0]] !== undefined;
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
