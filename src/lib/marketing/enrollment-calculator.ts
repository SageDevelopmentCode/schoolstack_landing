/** Monthly enrollment model. All money is integer cents. */

export const MAX_CALCULATOR_CENTS = 100_000_000_00;
export const MAX_CALCULATOR_ENROLLMENT = 100_000;

export type EnrollmentTuitionGroupInput = {
  tuitionCents: number;
  enrollment: number;
};

export type EnrollmentCalculatorInput = {
  tuitionCents: number;
  fixedExpensesCents: number;
  variableCostPerStudentCents: number;
  ownerCompensationCents: number;
  currentEnrollment: number;
  /** When set, enrollment is summed and tuition is enrollment-weighted for targets. */
  tuitionGroups?: EnrollmentTuitionGroupInput[];
};

export type MonthlyPosition = "surplus" | "shortfall" | "even";

export type EnrollmentEstimate = {
  tuitionCents: number;
  fixedExpensesCents: number;
  variableCostPerStudentCents: number;
  ownerCompensationCents: number;
  currentEnrollment: number;
  /** Tuition minus per-student cost. Not positive when another student cannot help. */
  contributionCents: number;
  viable: boolean;
  operatingBreakEven: number | null;
  compensationTarget: number | null;
  /** Students still needed from current enrollment. Never negative. Null when not viable. */
  additionalStudents: number | null;
};

export type MonthlyBreakdown = {
  enrollment: number;
  revenueCents: number;
  variableCostsCents: number;
  fixedExpensesCents: number;
  ownerCompensationCents: number;
  resultCents: number;
};

function toCents(value: number): number {
  if (!Number.isFinite(value)) return 0;
  return Math.min(MAX_CALCULATOR_CENTS, Math.max(0, Math.round(value)));
}

function toCount(value: number): number {
  if (!Number.isFinite(value)) return 0;
  return Math.min(MAX_CALCULATOR_ENROLLMENT, Math.max(0, Math.round(value)));
}

export function blendedTuitionCents(groups: EnrollmentTuitionGroupInput[]): number {
  if (groups.length === 0) return 0;
  let revenue = 0;
  let students = 0;
  for (const group of groups) {
    const enrollment = toCount(group.enrollment);
    const tuition = toCents(group.tuitionCents);
    revenue += enrollment * tuition;
    students += enrollment;
  }
  if (students <= 0) return toCents(groups[0]?.tuitionCents ?? 0);
  return Math.round(revenue / students);
}

function resolveEnrollmentInput(input: EnrollmentCalculatorInput): {
  tuitionCents: number;
  currentEnrollment: number;
} {
  const groups = input.tuitionGroups;
  if (!groups || groups.length === 0) {
    return {
      tuitionCents: toCents(input.tuitionCents),
      currentEnrollment: toCount(input.currentEnrollment),
    };
  }
  const currentEnrollment = groups.reduce((sum, group) => sum + toCount(group.enrollment), 0);
  return {
    tuitionCents: blendedTuitionCents(groups),
    currentEnrollment,
  };
}

/**
 * Whole students required to cover `amountCents` when each student contributes
 * `contributionCents`. Integer ceiling, so a remainder still rounds up.
 */
export function studentsForAmount(
  amountCents: number,
  contributionCents: number,
): number | null {
  if (contributionCents <= 0) return null;
  if (amountCents <= 0) return 0;
  if (
    !Number.isSafeInteger(amountCents) ||
    !Number.isSafeInteger(contributionCents) ||
    amountCents > Number.MAX_SAFE_INTEGER - (contributionCents - 1)
  ) {
    return null;
  }
  return Math.floor((amountCents + contributionCents - 1) / contributionCents);
}

export function monthlyResultCents(
  input: Pick<
    EnrollmentCalculatorInput,
    | "tuitionCents"
    | "fixedExpensesCents"
    | "variableCostPerStudentCents"
    | "ownerCompensationCents"
  >,
  enrollment: number,
): number {
  const tuitionCents = toCents(input.tuitionCents);
  const variableCostPerStudentCents = toCents(input.variableCostPerStudentCents);
  const fixedExpensesCents = toCents(input.fixedExpensesCents);
  const ownerCompensationCents = toCents(input.ownerCompensationCents);
  const students = toCount(enrollment);
  return (
    students * (tuitionCents - variableCostPerStudentCents) -
    fixedExpensesCents -
    ownerCompensationCents
  );
}

export function monthlyBreakdown(
  input: Pick<
    EnrollmentCalculatorInput,
    | "tuitionCents"
    | "fixedExpensesCents"
    | "variableCostPerStudentCents"
    | "ownerCompensationCents"
    | "currentEnrollment"
    | "tuitionGroups"
  >,
  enrollment: number,
): MonthlyBreakdown {
  const tuitionCents = resolveEnrollmentInput({
    tuitionCents: input.tuitionCents,
    fixedExpensesCents: input.fixedExpensesCents,
    variableCostPerStudentCents: input.variableCostPerStudentCents,
    ownerCompensationCents: input.ownerCompensationCents,
    currentEnrollment: input.currentEnrollment ?? 0,
    tuitionGroups: input.tuitionGroups,
  }).tuitionCents;
  const variableCostPerStudentCents = toCents(input.variableCostPerStudentCents);
  const fixedExpensesCents = toCents(input.fixedExpensesCents);
  const ownerCompensationCents = toCents(input.ownerCompensationCents);
  const students = toCount(enrollment);
  const revenueCents = students * tuitionCents;
  const variableCostsCents = students * variableCostPerStudentCents;
  return {
    enrollment: students,
    revenueCents,
    variableCostsCents,
    fixedExpensesCents,
    ownerCompensationCents,
    resultCents: revenueCents - variableCostsCents - fixedExpensesCents - ownerCompensationCents,
  };
}

export function monthlyPosition(resultCents: number): MonthlyPosition {
  if (resultCents > 0) return "surplus";
  if (resultCents < 0) return "shortfall";
  return "even";
}

export function computeEnrollmentEstimate(
  input: EnrollmentCalculatorInput,
): EnrollmentEstimate {
  const resolved = resolveEnrollmentInput(input);
  const tuitionCents = resolved.tuitionCents;
  const fixedExpensesCents = toCents(input.fixedExpensesCents);
  const variableCostPerStudentCents = toCents(input.variableCostPerStudentCents);
  const ownerCompensationCents = toCents(input.ownerCompensationCents);
  const currentEnrollment = resolved.currentEnrollment;
  const contributionCents = tuitionCents - variableCostPerStudentCents;
  const viable = contributionCents > 0;
  const operatingBreakEven = studentsForAmount(fixedExpensesCents, contributionCents);
  const compensationTarget = studentsForAmount(
    fixedExpensesCents + ownerCompensationCents,
    contributionCents,
  );
  const additionalStudents =
    compensationTarget === null
      ? null
      : Math.max(0, compensationTarget - currentEnrollment);

  return {
    tuitionCents,
    fixedExpensesCents,
    variableCostPerStudentCents,
    ownerCompensationCents,
    currentEnrollment,
    contributionCents,
    viable,
    operatingBreakEven,
    compensationTarget,
    additionalStudents,
  };
}

/** Slider ceiling that stays past the highest target instead of clipping it. */
export function enrollmentExploreMax(
  currentEnrollment: number,
  operatingBreakEven: number | null,
  compensationTarget: number | null,
  scenarioEnrollment: number,
): number {
  const peak = Math.max(
    toCount(currentEnrollment),
    toCount(scenarioEnrollment),
    operatingBreakEven ?? 0,
    compensationTarget ?? 0,
  );
  const base = Math.max(20, peak);
  const headroom = Math.max(8, Math.ceil(base * 0.2));
  const raw = base + headroom;
  const step = raw >= 100 ? 10 : 5;
  const rounded = Math.ceil(raw / step) * step;
  return Math.min(MAX_CALCULATOR_ENROLLMENT, Math.max(rounded, peak));
}

export function formatStudentCount(count: number): string {
  const safe = toCount(count);
  if (safe === 1) return "1 student";
  return `${safe.toLocaleString("en-US")} students`;
}

/** Whole dollars omit cents. A real remainder keeps two decimal places. */
export function formatCalculatorMoney(cents: number): string {
  const rounded = Number.isFinite(cents) ? Math.round(cents) : 0;
  const negative = rounded < 0;
  const absolute = Math.abs(rounded);
  const hasCents = absolute % 100 !== 0;
  const formatted = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: hasCents ? 2 : 0,
    maximumFractionDigits: hasCents ? 2 : 0,
  }).format(absolute / 100);
  return negative ? `−${formatted}` : formatted;
}
