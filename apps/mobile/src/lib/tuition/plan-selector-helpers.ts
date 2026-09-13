function parseIsoDate(iso: string): Date | null {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(iso)) return null;
  const [year, month, day] = iso.split('-').map(Number);
  return new Date(Date.UTC(year, month - 1, day));
}

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

export function canUseExtendedPaymentSchedule(
  ratePlanStart: string | null,
  billingStart: string,
): boolean {
  if (!ratePlanStart) return false;
  const planStart = parseIsoDate(ratePlanStart);
  const billing = parseIsoDate(billingStart);
  if (!planStart || !billing) return false;

  const planStartYm = planStart.getUTCFullYear() * 12 + planStart.getUTCMonth();
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

export function computeInstallmentAmountCents(
  tierAnnualAmountCents: number,
  installmentCount: number,
): number {
  if (installmentCount < 1) {
    throw new Error('Installment count must be at least 1.');
  }
  return Math.round(tierAnnualAmountCents / installmentCount);
}

export function schoolYearMonthSpan(
  effectiveStart?: string | null,
  effectiveEnd?: string | null,
): number | null {
  if (!effectiveStart || !effectiveEnd) return null;
  const start = parseIsoDate(effectiveStart);
  const end = parseIsoDate(effectiveEnd);
  if (!start || !end || end < start) return null;

  const startYear = start.getUTCFullYear();
  const startMonth = start.getUTCMonth();
  const endYear = end.getUTCFullYear();
  const endMonth = end.getUTCMonth();

  return (endYear - startYear) * 12 + (endMonth - startMonth) + 1;
}

const SUGGESTED_PAYMENT_SCHEDULES = [
  { count: 1, cadence: 'One-time payment' },
  { count: 4, cadence: 'Quarterly' },
  { count: 10, cadence: 'Monthly (10 payments)' },
];

export function paymentScheduleCadence(
  count: number,
  schoolYearMonths?: number | null,
): string {
  if (schoolYearMonths != null && count > 1 && count === schoolYearMonths) {
    return 'Monthly (matches your school year)';
  }

  const suggested = SUGGESTED_PAYMENT_SCHEDULES.find((schedule) => schedule.count === count);
  if (suggested) return suggested.cadence;
  if (count === 1) return 'One-time payment';
  return `${count} equal installments`;
}
