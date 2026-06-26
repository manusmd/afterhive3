const WEEKDAY_SHORT_TO_JS_DAY: Record<string, number> = {
  Sun: 0,
  Mon: 1,
  Tue: 2,
  Wed: 3,
  Thu: 4,
  Fri: 5,
  Sat: 6,
};

type ZonedParts = {
  year: number;
  month: number;
  day: number;
  hour: number;
  minute: number;
  second: number;
};

export function isValidTimeZone(timeZone: string) {
  try {
    Intl.DateTimeFormat(undefined, { timeZone });
    return true;
  } catch {
    return false;
  }
}

export function getZonedParts(date: Date, timeZone: string): ZonedParts {
  const formatter = new Intl.DateTimeFormat("en-US", {
    timeZone,
    year: "numeric",
    month: "numeric",
    day: "numeric",
    hour: "numeric",
    minute: "numeric",
    second: "numeric",
    hourCycle: "h23",
  });

  const parts: Partial<ZonedParts> = {};
  for (const part of formatter.formatToParts(date)) {
    if (part.type === "year") {
      parts.year = Number(part.value);
    } else if (part.type === "month") {
      parts.month = Number(part.value);
    } else if (part.type === "day") {
      parts.day = Number(part.value);
    } else if (part.type === "hour") {
      parts.hour = Number(part.value);
    } else if (part.type === "minute") {
      parts.minute = Number(part.value);
    } else if (part.type === "second") {
      parts.second = Number(part.value);
    }
  }

  return {
    year: parts.year ?? 0,
    month: parts.month ?? 0,
    day: parts.day ?? 0,
    hour: parts.hour ?? 0,
    minute: parts.minute ?? 0,
    second: parts.second ?? 0,
  };
}

export function getZonedWeekday(date: Date, timeZone: string) {
  const weekday = new Intl.DateTimeFormat("en-US", {
    timeZone,
    weekday: "short",
  }).format(date);

  return WEEKDAY_SHORT_TO_JS_DAY[weekday] ?? null;
}

export function zonedLocalDateTimeToUtc(
  year: number,
  month: number,
  day: number,
  hour: number,
  minute: number,
  second: number,
  timeZone: string,
) {
  let utcMs = Date.UTC(year, month - 1, day, hour, minute, second);

  for (let attempt = 0; attempt < 3; attempt += 1) {
    const parts = getZonedParts(new Date(utcMs), timeZone);
    const desiredMs = Date.UTC(year, month - 1, day, hour, minute, second);
    const actualMs = Date.UTC(
      parts.year,
      parts.month - 1,
      parts.day,
      parts.hour,
      parts.minute,
      parts.second,
    );
    utcMs += desiredMs - actualMs;
  }

  return new Date(utcMs);
}

export function parseLocalDateTimeInTimeZone(value: string, timeZone: string) {
  if (!isValidTimeZone(timeZone)) {
    return null;
  }

  const match = value.match(
    /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})(?::(\d{2}))?(?:\.\d+)?(?:Z|[+-]\d{2}:\d{2})?$/,
  );

  if (!match) {
    const parsed = new Date(value);
    return Number.isNaN(parsed.getTime()) ? null : parsed;
  }

  if (value.endsWith("Z") || /[+-]\d{2}:\d{2}$/.test(value)) {
    const parsed = new Date(value);
    return Number.isNaN(parsed.getTime()) ? null : parsed;
  }

  return zonedLocalDateTimeToUtc(
    Number(match[1]),
    Number(match[2]),
    Number(match[3]),
    Number(match[4]),
    Number(match[5]),
    Number(match[6] ?? 0),
    timeZone,
  );
}

export function addDaysInTimeZone(date: Date, days: number, timeZone: string) {
  const parts = getZonedParts(date, timeZone);
  const shifted = new Date(Date.UTC(parts.year, parts.month - 1, parts.day + days));

  return zonedLocalDateTimeToUtc(
    shifted.getUTCFullYear(),
    shifted.getUTCMonth() + 1,
    shifted.getUTCDate(),
    parts.hour,
    parts.minute,
    parts.second,
    timeZone,
  );
}
