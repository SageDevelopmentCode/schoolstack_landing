/** Sunday-first month grid, padded with `null` to whole weeks (same as the old month panel). */
export function buildMonthGrid(monthDate: Date): (Date | null)[] {
  const monthStart = new Date(monthDate.getFullYear(), monthDate.getMonth(), 1);
  const leading = monthStart.getDay();
  const grid: (Date | null)[] = [];
  for (let i = 0; i < leading; i++) {
    grid.push(null);
  }
  for (let day = 1; day <= 31; day++) {
    const d = new Date(monthDate.getFullYear(), monthDate.getMonth(), day);
    if (d.getMonth() !== monthDate.getMonth()) break;
    grid.push(d);
  }
  while (grid.length % 7 !== 0) {
    grid.push(null);
  }
  return grid;
}

export const WEEKDAY_INITIALS = ['S', 'M', 'T', 'W', 'T', 'F', 'S'] as const;
export const WEEKDAY_NAMES = [
  'Sunday',
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
] as const;
