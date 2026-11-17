import { formatHoursMinutes } from '@/lib/teacher/my-hours/format-duration';

/**
 * My Hours header line, built only from loaded data:
 * "On the clock since 8:02 AM · 12h 30m of 30h this week".
 * `clockedInLabel` is the formatted start time (null when off the clock).
 */
export function myHoursStatusLine({
  clockedInLabel,
  week,
}: {
  clockedInLabel: string | null;
  week: { loggedMinutes: number; goalMinutes: number } | null;
}): string {
  const parts: string[] = [clockedInLabel ? `On the clock since ${clockedInLabel}` : 'Off the clock'];
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
  return parts.join(' · ');
}

/** "4h 30m to go" / "Goal met" for the week (null without a goal). */
export function weekToGoLabel(week: { loggedMinutes: number; goalMinutes: number }): string | null {
  if (week.goalMinutes <= 0) return null;
  const left = week.goalMinutes - week.loggedMinutes;
  return left > 0 ? `${formatHoursMinutes(left)} to go` : 'Goal met';
}
