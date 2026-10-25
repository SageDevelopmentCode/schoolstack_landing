export function shortDate(
  key: string,
  opts: Intl.DateTimeFormatOptions = { month: "short", day: "numeric" },
): string {
  if (!key) return "";
  return new Intl.DateTimeFormat("en-US", {
    ...opts,
    timeZone: "UTC",
  }).format(new Date(`${key}T12:00:00Z`));
}

export function weekLabel(edition: { week: string; weekEnd?: string }): string {
  if (!edition.week) return "Choose a week";
  const start = shortDate(edition.week, { month: "long", day: "numeric" });
  if (edition.weekEnd && edition.weekEnd !== edition.week) {
    const end = shortDate(edition.weekEnd, { month: "long", day: "numeric" });
    return `${start} – ${end}`;
  }
  return `Week of ${start}`;
}

export function plusDays(key: string, days: number): string {
  const d = new Date(`${key}T12:00:00Z`);
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}
