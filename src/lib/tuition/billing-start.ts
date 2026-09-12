import type { TuitionPaymentPlan } from "./types";

function parseIsoDate(iso: string): Date | null {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(iso)) return null;
  const [year, month, day] = iso.split("-").map(Number);
  return new Date(Date.UTC(year, month - 1, day));
}

export function formatBillingStartDate(date: Date): string {
  return date.toISOString().slice(0, 10);
}

function firstOfMonthUtc(year: number, month: number, day = 1): Date {
  return new Date(Date.UTC(year, month, Math.min(day, 28)));
}

/** Inclusive calendar months between billing start and school-year end. */
export function remainingBillableMonths(
  billingStart: string,
  ratePlanEnd: string | null,
): number | null {
  if (!ratePlanEnd) return null;
  const start = parseIsoDate(billingStart);
  const end = parseIsoDate(ratePlanEnd);
  if (!start || !end || end < start) return null;

  const startYear = start.getUTCFullYear();
  const startMonth = start.getUTCMonth();
  const endYear = end.getUTCFullYear();
  const endMonth = end.getUTCMonth();

  return (endYear - startYear) * 12 + (endMonth - startMonth) + 1;
}

/**
 * Late joiners in the school-year start month or the month after may keep full
 * installment counts (schedule extends past school-year end). Later joiners are
 * capped to remaining months in the school year.
 */
export function canUseExtendedPaymentSchedule(
  ratePlanStart: string | null,
  billingStart: string,
): boolean {
  if (!ratePlanStart) return false;
  const planStart = parseIsoDate(ratePlanStart);
  const billing = parseIsoDate(billingStart);
  if (!planStart || !billing) return false;

  const planStartYm =
    planStart.getUTCFullYear() * 12 + planStart.getUTCMonth();
  const billingYm = billing.getUTCFullYear() * 12 + billing.getUTCMonth();

  return billingYm <= planStartYm + 1;
}

export function maxInstallmentsForBillingStart(
  ratePlanStart: string | null,
  ratePlanEnd: string | null,
  billingStart: string,
): number | null {
  if (canUseExtendedPaymentSchedule(ratePlanStart, billingStart)) {
    return null;
  }
  return remainingBillableMonths(billingStart, ratePlanEnd);
}

export function filterPaymentPlansForBillingStart<T extends { installmentCount: number }>(
  plans: T[],
  maxInstallments: number | null,
): T[] {
  if (maxInstallments == null) return plans;
  return plans.filter(
    (plan) => plan.installmentCount === 1 || plan.installmentCount <= maxInstallments,
  );
}

export function isPaymentPlanAllowedForBillingStart(
  installmentCount: number,
  ratePlanStart: string | null,
  ratePlanEnd: string | null,
  billingStart: string,
): boolean {
  if (installmentCount === 1) return true;
  const maxInstallments = maxInstallmentsForBillingStart(
    ratePlanStart,
    ratePlanEnd,
    billingStart,
  );
  if (maxInstallments == null) return true;
  return installmentCount <= maxInstallments;
}

/**
 * Per-family billing start from rate plan bounds and enrollment date.
 * Stored on tuition_enrollment_assignments.effective_start.
 */
export function resolveAssignmentBillingStart(input: {
  ratePlanStart: string | null;
  enrollmentDate: Date;
  billingDayOfMonth: number;
}): string | null {
  const { ratePlanStart, enrollmentDate, billingDayOfMonth } = input;
  const billingDay = Math.min(Math.max(billingDayOfMonth, 1), 28);

  if (!ratePlanStart) {
    return formatBillingStartDate(
      firstOfMonthUtc(
        enrollmentDate.getUTCFullYear(),
        enrollmentDate.getUTCMonth(),
        billingDay,
      ),
    );
  }

  const planStart = parseIsoDate(ratePlanStart);
  if (!planStart) return ratePlanStart;

  const enrollmentYear = enrollmentDate.getUTCFullYear();
  const enrollmentMonth = enrollmentDate.getUTCMonth();
  const enrollmentDay = enrollmentDate.getUTCDate();
  const planStartYear = planStart.getUTCFullYear();
  const planStartMonth = planStart.getUTCMonth();

  const enrollmentYm = enrollmentYear * 12 + enrollmentMonth;
  const planStartYm = planStartYear * 12 + planStartMonth;

  if (enrollmentYm < planStartYm) {
    return formatBillingStartDate(
      firstOfMonthUtc(planStartYear, planStartMonth, billingDay),
    );
  }

  if (enrollmentYm === planStartYm) {
    if (enrollmentDay > billingDay) {
      return formatBillingStartDate(
        firstOfMonthUtc(planStartYear, planStartMonth + 1, billingDay),
      );
    }
    return formatBillingStartDate(
      firstOfMonthUtc(planStartYear, planStartMonth, billingDay),
    );
  }

  return formatBillingStartDate(
    firstOfMonthUtc(enrollmentYear, enrollmentMonth, billingDay),
  );
}

export function isDueDateBeforeBillingStart(
  dueDate: string,
  billingStart: string,
): boolean {
  return dueDate < billingStart;
}

const MONTH_NAMES = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

export function tuitionLabelForDueDate(dueDate: string, baseLabel = "Tuition"): string {
  const month = MONTH_NAMES[new Date(`${dueDate}T00:00:00Z`).getUTCMonth()];
  return `${month} ${baseLabel}`;
}

export function buildInstallmentSchedule(
  paymentPlan: Pick<TuitionPaymentPlan, "installmentCount" | "billingDayOfMonth">,
  billingStart: string,
): Array<{ dueDate: string; installmentNumber: number; label: string }> {
  const start = parseIsoDate(billingStart);
  if (!start) return [];

  const billingDay = paymentPlan.billingDayOfMonth ?? start.getUTCDate();
  const firstYear = start.getUTCFullYear();
  let firstMonth = start.getUTCMonth();
  if (start.getUTCDate() > billingDay) {
    firstMonth += 1;
  }

  const schedule: Array<{ dueDate: string; installmentNumber: number; label: string }> =
    [];
  for (let i = 0; i < paymentPlan.installmentCount; i++) {
    const dueDate = formatBillingStartDate(
      new Date(Date.UTC(firstYear, firstMonth + i, Math.min(billingDay, 28))),
    );
    schedule.push({
      dueDate,
      installmentNumber: i + 1,
      label: tuitionLabelForDueDate(dueDate),
    });
  }
  return schedule;
}
