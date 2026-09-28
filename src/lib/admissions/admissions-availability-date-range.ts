import { addCalendarDays } from "./admissions-observation-availability";

export const AVAILABILITY_DATE_RANGE_INVALID_CODE = "invalid_date_range";

export const DEFAULT_AVAILABILITY_WINDOW_MAX_INCLUSIVE_DAYS = 62;

export class AdmissionsAvailabilityDateRangeError extends Error {
  code: string;

  constructor(message: string, code: string = AVAILABILITY_DATE_RANGE_INVALID_CODE) {
    super(message);
    this.name = "AdmissionsAvailabilityDateRangeError";
    this.code = code;
  }
}

export function parseAdmissionsCalendarDate(value: string): string | null {
  const trimmed = value.trim();
  if (!/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) {
    return null;
  }

  const [year, month, day] = trimmed.split("-").map(Number);
  const utc = new Date(Date.UTC(year, month - 1, day));
  if (
    utc.getUTCFullYear() !== year ||
    utc.getUTCMonth() !== month - 1 ||
    utc.getUTCDate() !== day
  ) {
    return null;
  }

  return trimmed;
}

function inclusiveDayCount(startDate: string, endDate: string): number {
  let count = 0;
  let cursor = startDate;

  while (cursor <= endDate) {
    count += 1;
    cursor = addCalendarDays(cursor, 1);
  }

  return count;
}

export function assertAvailabilityDateWindow(
  start: string,
  end: string,
  maxInclusiveDays: number = DEFAULT_AVAILABILITY_WINDOW_MAX_INCLUSIVE_DAYS,
): void {
  const startDate = parseAdmissionsCalendarDate(start);
  const endDate = parseAdmissionsCalendarDate(end);

  if (!startDate || !endDate) {
    throw new AdmissionsAvailabilityDateRangeError(
      "start and end must be valid dates in YYYY-MM-DD format.",
    );
  }

  if (startDate > endDate) {
    throw new AdmissionsAvailabilityDateRangeError(
      "start must be on or before end.",
    );
  }

  const dayCount = inclusiveDayCount(startDate, endDate);
  if (dayCount > maxInclusiveDays) {
    throw new AdmissionsAvailabilityDateRangeError(
      `Date range may span at most ${maxInclusiveDays} days.`,
    );
  }
}
