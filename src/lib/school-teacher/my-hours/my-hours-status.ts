import { formatHoursMinutes } from "@/lib/school-teacher/my-hours/format-duration";

type WeekMinutes = { loggedMinutes: number; goalMinutes: number };

export function sessionCountLabel(count: number): string {
  return `${count} ${count === 1 ? "session" : "sessions"}`;
}

/**
 * My Hours header line, built only from loaded data (same wording as the
 * mobile Garden My Hours): "On the clock since 8:02 AM · 12h 30m of 30h this
 * week". `clockedInLabel` is the formatted start time (null when off the clock).
 */
export function myHoursStatusLine({
  clockedInLabel,
  week,
}: {
  clockedInLabel: string | null;
  week: WeekMinutes | null;
}): string {
  const parts: string[] = [
    clockedInLabel ? `On the clock since ${clockedInLabel}` : "Off the clock",
  ];
  if (week) {
    if (week.goalMinutes > 0) {
      parts.push(
        week.loggedMinutes >= week.goalMinutes
          ? `${formatHoursMinutes(week.loggedMinutes)} this week · goal met`
          : `${formatHoursMinutes(week.loggedMinutes)} of ${formatHoursMinutes(week.goalMinutes)} this week`,
      );
    } else {
      parts.push(`${formatHoursMinutes(week.loggedMinutes)} this week`);
    }
  }
  return parts.join(" · ");
}

/** "4h 30m to go" / "Goal met" for the week (null without a goal). */
export function weekToGoLabel(week: WeekMinutes): string | null {
  if (week.goalMinutes <= 0) return null;
  const left = week.goalMinutes - week.loggedMinutes;
  return left > 0 ? `${formatHoursMinutes(left)} to go` : "Goal met";
}

/**
 * The time clock's "today" line: closed minutes plus the live session when it
 * counts toward today. "Today: 3h 12m · 2 sessions" / "Today: nothing logged yet".
 */
export function todayClockLine({
  closedMinutes,
  closedSessions,
  activeCountsToday,
  elapsedSeconds,
}: {
  closedMinutes: number;
  closedSessions: number;
  activeCountsToday: boolean;
  elapsedSeconds: number;
}): string {
  const live = activeCountsToday ? Math.floor(Math.max(0, elapsedSeconds) / 60) : 0;
  const sessions = closedSessions + (activeCountsToday ? 1 : 0);
  if (sessions === 0) return "Today: nothing logged yet";
  return `Today: ${formatHoursMinutes(closedMinutes + live)} · ${sessionCountLabel(sessions)}`;
}

/** Week bar fill for a day: its minutes as a share of the bar's scale, capped at 1. */
export function dayBarFraction(minutes: number, scaleMinutes: number): number {
  if (minutes <= 0 || scaleMinutes <= 0) return 0;
  return Math.min(1, minutes / scaleMinutes);
}

/** Compact total for tight cells (week bars, month grid): "45m", "8h", "8.1h". */
export function compactHours(minutes: number): string {
  if (minutes <= 0) return "0m";
  if (minutes < 60) return `${minutes}m`;
  const hours = minutes / 60;
  return Number.isInteger(hours) ? `${hours}h` : `${hours.toFixed(1)}h`;
}
