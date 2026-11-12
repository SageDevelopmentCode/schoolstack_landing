const DEFAULT_NEXT_CLOCK_IN = '08:00';
const DEFAULT_NEXT_CLOCK_OUT = '15:00';
const MAX_MINUTES_IN_DAY = 24 * 60 - 1;

function minutesFromTime(value: string): number | null {
  const [hourText, minuteText] = value.split(':');
  if (hourText == null || minuteText == null) return null;
  const hour = Number(hourText);
  const minute = Number(minuteText);
  if (Number.isNaN(hour) || Number.isNaN(minute)) return null;
  if (hour > 23 || minute > 59) return null;
  return hour * 60 + minute;
}

function minutesToTimeInput(minutes: number): string {
  const hour = Math.floor(minutes / 60);
  const minute = minutes % 60;
  return `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;
}

function adjustmentSessionRangesOverlap(
  ranges: Array<{ start: number; end: number }>,
): boolean {
  if (ranges.length < 2) return false;
  const sorted = [...ranges].sort((a, b) => a.start - b.start);
  for (let i = 0; i < sorted.length - 1; i += 1) {
    const current = sorted[i];
    const next = sorted[i + 1];
    if (current.start < next.end && next.start < current.end) {
      return true;
    }
  }
  return false;
}

export function adjustmentSessionsOverlap(
  sessions: Array<{ clockIn: string; clockOut: string }>,
): boolean {
  const ranges: Array<{ start: number; end: number }> = [];
  for (const session of sessions) {
    const start = minutesFromTime(session.clockIn);
    const end = minutesFromTime(session.clockOut);
    if (start == null || end == null || end <= start) continue;
    ranges.push({ start, end });
  }
  if (ranges.length < 2) return false;
  return adjustmentSessionRangesOverlap(ranges);
}

export function defaultNextAdjustmentSession(
  sessions: Array<{ clockIn: string; clockOut: string }>,
): { clockIn: string; clockOut: string } {
  let latestEnd: number | null = null;
  for (const session of sessions) {
    const start = minutesFromTime(session.clockIn);
    const end = minutesFromTime(session.clockOut);
    if (start == null || end == null || end <= start) continue;
    latestEnd = latestEnd == null ? end : Math.max(latestEnd, end);
  }
  if (latestEnd == null) {
    return { clockIn: DEFAULT_NEXT_CLOCK_IN, clockOut: DEFAULT_NEXT_CLOCK_OUT };
  }
  const defaultEnd = minutesFromTime(DEFAULT_NEXT_CLOCK_OUT) ?? 15 * 60;
  let clockOut = Math.max(defaultEnd, latestEnd + 7 * 60);
  clockOut = Math.min(clockOut, MAX_MINUTES_IN_DAY);
  if (clockOut <= latestEnd) {
    clockOut = Math.min(latestEnd + 60, MAX_MINUTES_IN_DAY);
  }
  return {
    clockIn: minutesToTimeInput(latestEnd),
    clockOut: minutesToTimeInput(clockOut),
  };
}
