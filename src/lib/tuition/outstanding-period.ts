import type { RawKpiChargeRow } from "./kpi-breakdown";
import { remainingChargeBalanceCents } from "./kpi-breakdown";

export type OutstandingPeriod =
  | "current_month"
  | "next_month"
  | "next_3_months"
  | "school_year_remainder";

export type SchoolYearBounds = {
  effectiveStart: string | null;
  effectiveEnd: string | null;
};

export type OutstandingDateRange = {
  startDate: string;
  endDate: string;
};

const OPEN_CHARGE_STATUSES = new Set(["scheduled", "sent", "overdue"]);

export const OUTSTANDING_PERIOD_OPTIONS: Array<{
  value: OutstandingPeriod;
  label: string;
  requiresSchoolYearEnd?: boolean;
}> = [
  { value: "current_month", label: "This month" },
  { value: "next_month", label: "Next month" },
  { value: "next_3_months", label: "Next 3 months" },
  { value: "school_year_remainder", label: "Rest of school year", requiresSchoolYearEnd: true },
];

export function deriveSchoolYearBounds(
  ratePlans: Array<{
    status: string;
    effectiveStart: string | null;
    effectiveEnd: string | null;
  }>,
): SchoolYearBounds {
  let effectiveStart: string | null = null;
  let effectiveEnd: string | null = null;

  for (const plan of ratePlans) {
    if (plan.status === "draft") continue;
    if (plan.effectiveStart && (!effectiveStart || plan.effectiveStart < effectiveStart)) {
      effectiveStart = plan.effectiveStart;
    }
    if (plan.effectiveEnd && (!effectiveEnd || plan.effectiveEnd > effectiveEnd)) {
      effectiveEnd = plan.effectiveEnd;
    }
  }

  return { effectiveStart, effectiveEnd };
}

export function availableOutstandingPeriods(
  schoolYearBounds: SchoolYearBounds,
): OutstandingPeriod[] {
  return OUTSTANDING_PERIOD_OPTIONS.filter(
    (option) => !option.requiresSchoolYearEnd || schoolYearBounds.effectiveEnd != null,
  ).map((option) => option.value);
}

export function outstandingPeriodLabel(period: OutstandingPeriod): string {
  return OUTSTANDING_PERIOD_OPTIONS.find((option) => option.value === period)?.label ?? period;
}

function toIsoDateLocal(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function startOfMonthLocal(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

function endOfMonthLocal(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth() + 1, 0);
}

export function isIsoDateInRange(
  isoDate: string,
  range: OutstandingDateRange,
): boolean {
  return isoDate >= range.startDate && isoDate <= range.endDate;
}

export function resolveOutstandingDateRange(
  period: OutstandingPeriod,
  referenceDate = new Date(),
  schoolYearBounds: SchoolYearBounds = { effectiveStart: null, effectiveEnd: null },
): OutstandingDateRange | null {
  const today = toIsoDateLocal(referenceDate);

  if (period === "current_month") {
    const start = startOfMonthLocal(referenceDate);
    const end = endOfMonthLocal(referenceDate);
    return { startDate: toIsoDateLocal(start), endDate: toIsoDateLocal(end) };
  }

  if (period === "next_month") {
    const nextMonth = new Date(referenceDate.getFullYear(), referenceDate.getMonth() + 1, 1);
    const start = startOfMonthLocal(nextMonth);
    const end = endOfMonthLocal(nextMonth);
    return { startDate: toIsoDateLocal(start), endDate: toIsoDateLocal(end) };
  }

  if (period === "next_3_months") {
    const start = startOfMonthLocal(referenceDate);
    const end = endOfMonthLocal(
      new Date(referenceDate.getFullYear(), referenceDate.getMonth() + 2, 1),
    );
    return { startDate: toIsoDateLocal(start), endDate: toIsoDateLocal(end) };
  }

  if (!schoolYearBounds.effectiveEnd) return null;
  return {
    startDate: today,
    endDate: schoolYearBounds.effectiveEnd,
  };
}

export function chargeMatchesOutstandingPeriod(
  charge: RawKpiChargeRow,
  period: OutstandingPeriod,
  range: OutstandingDateRange | null,
): boolean {
  if (!OPEN_CHARGE_STATUSES.has(String(charge.status))) return false;
  if (remainingChargeBalanceCents(charge) <= 0) return false;

  if (period !== "next_month" && charge.status === "overdue") {
    return true;
  }

  if (!range) return false;
  return isIsoDateInRange(String(charge.due_date), range);
}

export function computeOutstandingCentsFromCharges(
  charges: RawKpiChargeRow[],
  period: OutstandingPeriod,
  schoolYearBounds: SchoolYearBounds,
  referenceDate = new Date(),
): number {
  const range = resolveOutstandingDateRange(period, referenceDate, schoolYearBounds);
  if (period === "school_year_remainder" && !range) return 0;

  return charges.reduce((sum, charge) => {
    if (!chargeMatchesOutstandingPeriod(charge, period, range)) return sum;
    return sum + remainingChargeBalanceCents(charge);
  }, 0);
}
