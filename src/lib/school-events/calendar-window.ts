function pad2(value: number): string {
  return String(value).padStart(2, "0");
}

export function formatCalendarDateKey(date: Date): string {
  return `${date.getFullYear()}-${pad2(date.getMonth() + 1)}-${pad2(date.getDate())}`;
}

/** @param month 0-indexed month (JavaScript Date#getMonth). */
export function calendarEventWindowForMonth(year: number, month: number) {
  const start = new Date(year, month - 1, 1);
  const end = new Date(year, month + 2, 0);

  return {
    startDate: formatCalendarDateKey(start),
    endDate: formatCalendarDateKey(end),
  };
}

export function calendarEventWindowForToday(referenceDate = new Date()) {
  return calendarEventWindowForMonth(
    referenceDate.getFullYear(),
    referenceDate.getMonth(),
  );
}
