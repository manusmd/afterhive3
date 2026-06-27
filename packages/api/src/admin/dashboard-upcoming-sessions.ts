type SessionListItem = {
  sessionId: string;
  label: string;
};

export type DashboardUpcomingSession = {
  sessionId: string;
  title: string;
  startsAt: Date;
};

export function parseUpcomingSessions(
  items: SessionListItem[],
  limit = 5,
): DashboardUpcomingSession[] {
  const now = Date.now();

  return items
    .map((item) => {
      const parts = item.label.split(" · ");
      const iso = parts.at(-1) ?? "";
      const startsAt = new Date(iso);

      return {
        sessionId: item.sessionId,
        title: parts.slice(0, -1).join(" · "),
        startsAt,
      };
    })
    .filter((item) => !Number.isNaN(item.startsAt.getTime()) && item.startsAt.getTime() >= now)
    .slice(0, limit);
}

export function countSessionsOnDate(
  sessions: DashboardUpcomingSession[],
  date: Date,
  timeZone: string,
) {
  const formatter = new Intl.DateTimeFormat("en-CA", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
  const target = formatter.format(date);

  return sessions.filter((session) => formatter.format(session.startsAt) === target).length;
}
