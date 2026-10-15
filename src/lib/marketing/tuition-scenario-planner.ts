/**
 * Annual tuition scenario model. All money is integer cents.
 *
 * For each program group:
 *   Gross = T × N × M
 *   Annual sibling discounts = d × sibling recipients × M
 *   Annual scholarships = s × scholarship recipients × M
 *   Net = Gross − discounts − scholarships
 *
 * Sibling recipients and scholarship recipients are different students.
 * Percent reductions are rounded to the nearest cent once per student per
 * billing month, then multiplied by recipients and months.
 */

import {
  MAX_CALCULATOR_CENTS,
  formatCalculatorMoney,
} from "@/lib/marketing/enrollment-calculator";

export const MAX_PLANNER_TUITION_CENTS = MAX_CALCULATOR_CENTS;
export const MAX_PLANNER_ENROLLMENT = 500;
export const ENROLLMENT_SLIDER_MAX = 60;
export const MIN_BILLING_MONTHS = 1;
export const MAX_BILLING_MONTHS = 12;
export const DEFAULT_BILLING_MONTHS = 10;
export const MAX_PLANNER_RECIPIENTS = 10_000;
export const MAX_PERCENT_HUNDREDTHS = 10_000;
export const STARTER_TUITION_CENTS = 80_000;
export const STARTER_ENROLLMENT = 12;
export const RAISE_TUITION_CENTS = 10_000;
export const GROW_ENROLLMENT_BY = 2;
export const PART_TIME_ENROLLMENT = 4;

export type DiscountMode = "percent" | "fixed";

export type GroupAdjustment = {
  enabled: boolean;
  mode: DiscountMode;
  /** 10.50% is stored as 1050. 100% is 10000. */
  percentHundredths: number;
  amountCents: number;
  recipientCount: number;
};

export type ProgramGroup = {
  id: string;
  label: string;
  monthlyTuitionCents: number;
  enrollment: number;
  billingMonths: number;
  siblingDiscount: GroupAdjustment;
  scholarship: GroupAdjustment;
};

export type Scenario = {
  id: string;
  name: string;
  groups: ProgramGroup[];
  /** Assumptions captured when the scenario was created. Reset restores these. */
  originGroups: ProgramGroup[];
};

export type GroupComputation = {
  label: string;
  valid: boolean;
  messages: string[];
  grossCents: number | null;
  annualSiblingDiscountCents: number | null;
  annualScholarshipCents: number | null;
  netCents: number | null;
};

export type ScenarioComputation = {
  valid: boolean;
  messages: string[];
  groups: GroupComputation[];
  grossCents: number | null;
  annualSiblingDiscountCents: number | null;
  annualScholarshipCents: number | null;
  netCents: number | null;
  totalStudents: number;
  /** Sum of enrollment × billing months. Denominator for effective tuition. */
  studentMonths: number;
  hasReduction: boolean;
  effectiveMonthlyTuitionCents: number | null;
};

export type ComparisonDirection = "higher" | "lower" | "same" | "baseline" | "unavailable";

export type ScenarioComparison = {
  differenceCents: number | null;
  differenceLabel: string;
  direction: ComparisonDirection;
  percentageLabel: string | null;
};

export function emptyAdjustment(): GroupAdjustment {
  return {
    enabled: false,
    mode: "percent",
    percentHundredths: 0,
    amountCents: 0,
    recipientCount: 0,
  };
}

export function halfTuitionToNearestDollar(tuitionCents: number): number {
  const safe = clampTuitionCents(tuitionCents);
  const dollars = safe / 100;
  return Math.round(dollars / 2) * 100;
}

export function clampTuitionCents(value: number): number {
  if (!Number.isFinite(value)) return 0;
  return Math.min(MAX_PLANNER_TUITION_CENTS, Math.max(0, Math.round(value)));
}

export function clampEnrollment(value: number): number {
  if (!Number.isFinite(value)) return 0;
  return Math.min(MAX_PLANNER_ENROLLMENT, Math.max(0, Math.round(value)));
}

export function clampBillingMonths(value: number): number {
  if (!Number.isFinite(value)) return DEFAULT_BILLING_MONTHS;
  return Math.min(MAX_BILLING_MONTHS, Math.max(MIN_BILLING_MONTHS, Math.round(value)));
}

export function clampPercentHundredths(value: number): number {
  if (!Number.isFinite(value)) return 0;
  return Math.min(MAX_PERCENT_HUNDREDTHS, Math.max(0, Math.round(value)));
}

export function clampRecipientCount(value: number): number {
  if (!Number.isFinite(value)) return 0;
  return Math.min(MAX_PLANNER_RECIPIENTS, Math.max(0, Math.round(value)));
}

export function clampAdjustmentAmount(value: number): number {
  if (!Number.isFinite(value)) return 0;
  return Math.min(MAX_PLANNER_TUITION_CENTS, Math.max(0, Math.round(value)));
}

function studentWord(count: number): string {
  return count === 1 ? "student" : "students";
}

function recipientOverEnrollmentMessage(
  kind: "sibling" | "scholarship",
  recipients: number,
  enrollment: number,
): string {
  const subject =
    kind === "sibling"
      ? `${recipients} ${recipients === 1 ? "student has" : "students have"} a sibling discount`
      : `${recipients} ${recipients === 1 ? "student has" : "students have"} a scholarship`;
  return `${subject}, but this group has ${enrollment} ${studentWord(enrollment)}.`;
}

function recipientOverTotalEnrollmentMessage(
  kind: "sibling" | "scholarship",
  recipients: number,
  enrollment: number,
): string {
  const subject =
    kind === "sibling"
      ? `${recipients} ${recipients === 1 ? "student has" : "students have"} a sibling discount`
      : `${recipients} ${recipients === 1 ? "student has" : "students have"} a scholarship`;
  return `${subject}, but this estimate has ${enrollment} ${studentWord(enrollment)}.`;
}

function adjustmentRateIssues(
  adjustment: GroupAdjustment,
  kind: "sibling" | "scholarship",
  tuitionCents: number,
): string[] {
  if (!adjustment.enabled) return [];
  const issues: string[] = [];
  if (adjustment.mode === "percent" && adjustment.percentHundredths > MAX_PERCENT_HUNDREDTHS) {
    issues.push("A discount can't be more than 100% of tuition.");
  }
  if (adjustment.mode === "fixed" && adjustment.amountCents > tuitionCents) {
    issues.push(
      kind === "sibling"
        ? "The sibling discount is higher than monthly tuition."
        : "The scholarship is higher than monthly tuition.",
    );
  }
  return issues;
}

function adjustmentIssues(
  adjustment: GroupAdjustment,
  kind: "sibling" | "scholarship",
  tuitionCents: number,
  enrollment: number,
): string[] {
  if (!adjustment.enabled || adjustment.recipientCount <= 0) return adjustmentRateIssues(adjustment, kind, tuitionCents);
  const issues = adjustmentRateIssues(adjustment, kind, tuitionCents);
  if (adjustment.recipientCount > enrollment) {
    issues.push(recipientOverEnrollmentMessage(kind, adjustment.recipientCount, enrollment));
  }
  return issues;
}

function monthlyReductionCents(tuitionCents: number, adjustment: GroupAdjustment): number {
  if (!adjustment.enabled) return 0;
  if (adjustment.mode === "percent") {
    return Math.round((tuitionCents * adjustment.percentHundredths) / MAX_PERCENT_HUNDREDTHS);
  }
  return adjustment.amountCents;
}

/** Split a school-wide recipient count across groups by enrollment (largest remainder). */
export function allocateRecipientsAcrossGroups(totalRecipients: number, enrollments: number[]): number[] {
  const total = clampRecipientCount(totalRecipients);
  if (total === 0 || enrollments.length === 0) {
    return enrollments.map(() => 0);
  }

  const safeEnrollments = enrollments.map((value) =>
    Number.isInteger(value) && value > 0 ? value : 0,
  );
  const enrollmentSum = safeEnrollments.reduce((sum, value) => sum + value, 0);
  if (enrollmentSum === 0) {
    return enrollments.map(() => 0);
  }

  const capped = Math.min(total, enrollmentSum);
  const exact = safeEnrollments.map((enrollment) => (enrollment / enrollmentSum) * capped);
  const floors = exact.map((value) => Math.floor(value));
  let remainder = capped - floors.reduce((sum, value) => sum + value, 0);
  const ranked = exact
    .map((value, index) => ({ index, remainder: value - floors[index] }))
    .sort((left, right) => right.remainder - left.remainder);

  const allocated = [...floors];
  for (let slot = 0; remainder > 0; slot += 1) {
    const target = ranked[slot % ranked.length];
    if (!target) break;
    allocated[target.index] += 1;
    remainder -= 1;
  }

  return allocated.map((count, index) => Math.min(count, safeEnrollments[index] ?? 0));
}

function schoolWideRecipientCount(
  groups: ProgramGroup[],
  kind: "siblingDiscount" | "scholarship",
): number {
  const adjustment = groups[0]?.[kind];
  if (!adjustment?.enabled) return 0;
  return adjustment.recipientCount;
}

export type ComputeGroupOverrides = {
  siblingRecipients?: number;
  scholarshipRecipients?: number;
};

export function computeGroup(group: ProgramGroup, overrides?: ComputeGroupOverrides): GroupComputation {
  const messages: string[] = [];
  const tuition = group.monthlyTuitionCents;
  const enrollment = group.enrollment;
  const months = group.billingMonths;

  if (!Number.isInteger(tuition) || tuition < 0) {
    messages.push("Tuition can't be negative.");
  }
  if (!Number.isInteger(enrollment) || enrollment < 0) {
    messages.push("Enrollment can't be negative.");
  }
  if (
    !Number.isInteger(months) ||
    months < MIN_BILLING_MONTHS ||
    months > MAX_BILLING_MONTHS
  ) {
    messages.push("Billing months must be between 1 and 12.");
  }

  const safeTuition = Math.max(0, tuition);
  const safeEnrollment = Math.max(0, enrollment);
  const siblingRecipients =
    overrides?.siblingRecipients ??
    (group.siblingDiscount.enabled ? group.siblingDiscount.recipientCount : 0);
  const scholarshipRecipients =
    overrides?.scholarshipRecipients ??
    (group.scholarship.enabled ? group.scholarship.recipientCount : 0);

  if (overrides) {
    messages.push(
      ...adjustmentRateIssues(group.siblingDiscount, "sibling", safeTuition),
      ...adjustmentRateIssues(group.scholarship, "scholarship", safeTuition),
    );
    if (group.siblingDiscount.enabled && siblingRecipients > safeEnrollment) {
      messages.push(recipientOverEnrollmentMessage("sibling", siblingRecipients, safeEnrollment));
    }
    if (group.scholarship.enabled && scholarshipRecipients > safeEnrollment) {
      messages.push(recipientOverEnrollmentMessage("scholarship", scholarshipRecipients, safeEnrollment));
    }
  } else {
    messages.push(
      ...adjustmentIssues(group.siblingDiscount, "sibling", safeTuition, safeEnrollment),
      ...adjustmentIssues(group.scholarship, "scholarship", safeTuition, safeEnrollment),
    );
    const individualsFit =
      siblingRecipients <= safeEnrollment && scholarshipRecipients <= safeEnrollment;
    if (
      individualsFit &&
      siblingRecipients > 0 &&
      scholarshipRecipients > 0 &&
      siblingRecipients + scholarshipRecipients > safeEnrollment
    ) {
      messages.push(
        `Sibling discounts and scholarships apply to different students. Those ${siblingRecipients + scholarshipRecipients} recipients don't fit within ${safeEnrollment} ${studentWord(safeEnrollment)}.`,
      );
    }
  }

  if (messages.length > 0) {
    return {
      label: group.label,
      valid: false,
      messages,
      grossCents: null,
      annualSiblingDiscountCents: null,
      annualScholarshipCents: null,
      netCents: null,
    };
  }

  const grossCents = tuition * enrollment * months;
  const siblingMonthly = monthlyReductionCents(tuition, group.siblingDiscount);
  const scholarshipMonthly = monthlyReductionCents(tuition, group.scholarship);
  const annualSiblingDiscountCents = siblingMonthly * siblingRecipients * months;
  const annualScholarshipCents = scholarshipMonthly * scholarshipRecipients * months;
  const netCents = grossCents - annualSiblingDiscountCents - annualScholarshipCents;

  return {
    label: group.label,
    valid: true,
    messages: [],
    grossCents,
    annualSiblingDiscountCents,
    annualScholarshipCents,
    netCents,
  };
}

export function computeScenario(groups: ProgramGroup[]): ScenarioComputation {
  const prefix = groups.length > 1;
  const totalStudents = groups.reduce((sum, group) => {
    return sum + (Number.isInteger(group.enrollment) && group.enrollment > 0 ? group.enrollment : 0);
  }, 0);

  const scenarioMessages: string[] = [];
  if (groups.length > 1) {
    const schoolWideSibling = schoolWideRecipientCount(groups, "siblingDiscount");
    const schoolWideScholarship = schoolWideRecipientCount(groups, "scholarship");
    if (schoolWideSibling > totalStudents) {
      scenarioMessages.push(
        recipientOverTotalEnrollmentMessage("sibling", schoolWideSibling, totalStudents),
      );
    }
    if (schoolWideScholarship > totalStudents) {
      scenarioMessages.push(
        recipientOverTotalEnrollmentMessage("scholarship", schoolWideScholarship, totalStudents),
      );
    }
    if (
      schoolWideSibling > 0 &&
      schoolWideScholarship > 0 &&
      schoolWideSibling + schoolWideScholarship > totalStudents
    ) {
      scenarioMessages.push(
        `Sibling discounts and scholarships apply to different students. Those ${schoolWideSibling + schoolWideScholarship} recipients don't fit within ${totalStudents} ${studentWord(totalStudents)}.`,
      );
    }
  }

  const siblingAllocation =
    groups.length > 1
      ? allocateRecipientsAcrossGroups(
          schoolWideRecipientCount(groups, "siblingDiscount"),
          groups.map((group) => group.enrollment),
        )
      : [];
  const scholarshipAllocation =
    groups.length > 1
      ? allocateRecipientsAcrossGroups(
          schoolWideRecipientCount(groups, "scholarship"),
          groups.map((group) => group.enrollment),
        )
      : [];

  const groupResults = groups.map((group, index) => {
    if (groups.length <= 1) return computeGroup(group);
    return computeGroup(group, {
      siblingRecipients: siblingAllocation[index] ?? 0,
      scholarshipRecipients: scholarshipAllocation[index] ?? 0,
    });
  });

  const messages = [
    ...scenarioMessages,
    ...groupResults.flatMap((result, index) => {
      if (result.messages.length === 0) return [];
      const label = groups[index]?.label || "Group";
      return prefix ? result.messages.map((message) => `${label}: ${message}`) : result.messages;
    }),
  ];
  const valid =
    groupResults.every((result) => result.valid) && groupResults.length > 0 && scenarioMessages.length === 0;
  const studentMonths = groups.reduce((sum, group) => {
    if (!Number.isInteger(group.enrollment) || group.enrollment < 0) return sum;
    if (!Number.isInteger(group.billingMonths) || group.billingMonths < 1) return sum;
    return sum + group.enrollment * group.billingMonths;
  }, 0);

  if (!valid) {
    return {
      valid: false,
      messages,
      groups: groupResults,
      grossCents: null,
      annualSiblingDiscountCents: null,
      annualScholarshipCents: null,
      netCents: null,
      totalStudents,
      studentMonths,
      hasReduction: false,
      effectiveMonthlyTuitionCents: null,
    };
  }

  const grossCents = groupResults.reduce((sum, result) => sum + (result.grossCents ?? 0), 0);
  const annualSiblingDiscountCents = groupResults.reduce(
    (sum, result) => sum + (result.annualSiblingDiscountCents ?? 0),
    0,
  );
  const annualScholarshipCents = groupResults.reduce(
    (sum, result) => sum + (result.annualScholarshipCents ?? 0),
    0,
  );
  const netCents = grossCents - annualSiblingDiscountCents - annualScholarshipCents;
  const hasReduction = annualSiblingDiscountCents + annualScholarshipCents > 0;
  const effectiveMonthlyTuitionCents =
    hasReduction && studentMonths > 0 ? Math.round(netCents / studentMonths) : null;

  return {
    valid: true,
    messages: [],
    groups: groupResults,
    grossCents,
    annualSiblingDiscountCents,
    annualScholarshipCents,
    netCents,
    totalStudents,
    studentMonths,
    hasReduction,
    effectiveMonthlyTuitionCents,
  };
}

export function percentageChange(
  differenceCents: number,
  baselineNetCents: number,
): number | null {
  if (baselineNetCents <= 0) return null;
  return (differenceCents / baselineNetCents) * 100;
}

export function formatPercentageChange(percent: number): string {
  const rounded = Math.round(percent * 10) / 10;
  if (rounded === 0) return "0%";
  const negative = rounded < 0;
  const absolute = Math.abs(rounded);
  const text = Number.isInteger(absolute) ? String(absolute) : absolute.toFixed(1);
  return negative ? `−${text}%` : `+${text}%`;
}

export function formatAnnualDifference(differenceCents: number): string {
  if (differenceCents === 0) return "No change in annual revenue";
  if (differenceCents > 0) return `+${formatCalculatorMoney(differenceCents)} per year`;
  return `${formatCalculatorMoney(differenceCents)} per year`;
}

export function compareScenario(
  result: ScenarioComputation,
  baseline: ScenarioComputation,
  isBaseline: boolean,
): ScenarioComparison {
  if (isBaseline) {
    return {
      differenceCents: 0,
      differenceLabel: "Baseline for comparison",
      direction: "baseline",
      percentageLabel: null,
    };
  }
  if (!result.valid || !baseline.valid || result.netCents === null || baseline.netCents === null) {
    return {
      differenceCents: null,
      differenceLabel: "Fix the highlighted assumptions to compare revenue.",
      direction: "unavailable",
      percentageLabel: null,
    };
  }

  const differenceCents = result.netCents - baseline.netCents;
  const percent = percentageChange(differenceCents, baseline.netCents);
  let percentageLabel: string | null = null;
  if (differenceCents === 0) {
    percentageLabel = null;
  } else if (percent !== null) {
    percentageLabel = formatPercentageChange(percent);
  } else if (baseline.netCents === 0) {
    percentageLabel = "Percentage unavailable because the baseline is $0";
  }

  return {
    differenceCents,
    differenceLabel: formatAnnualDifference(differenceCents),
    direction: differenceCents === 0 ? "same" : differenceCents > 0 ? "higher" : "lower",
    percentageLabel,
  };
}

function adjustmentsInactiveOrEqual(a: GroupAdjustment, b: GroupAdjustment): boolean {
  if (!a.enabled && !b.enabled) return true;
  return (
    a.enabled === b.enabled &&
    a.mode === b.mode &&
    a.percentHundredths === b.percentHundredths &&
    a.amountCents === b.amountCents &&
    a.recipientCount === b.recipientCount
  );
}

function sameTuitionStructure(scenario: ProgramGroup[], baseline: ProgramGroup[]): boolean {
  if (scenario.length !== baseline.length || scenario.length === 0) return false;
  return scenario.every((group, index) => {
    const other = baseline[index];
    if (!other) return false;
    return (
      group.monthlyTuitionCents === other.monthlyTuitionCents &&
      group.billingMonths === other.billingMonths &&
      adjustmentsInactiveOrEqual(group.siblingDiscount, other.siblingDiscount) &&
      adjustmentsInactiveOrEqual(group.scholarship, other.scholarship)
    );
  });
}

function additionalStudentPhrase(count: number): string {
  if (count === 1) return "One additional student";
  if (count === 2) return "Two additional students";
  return `${count} additional students`;
}

export function scenarioInsights(
  scenario: Scenario,
  result: ScenarioComputation,
  baseline: Scenario,
  baselineResult: ScenarioComputation,
): string[] {
  if (scenario.id === baseline.id) return [];
  if (
    !result.valid ||
    !baselineResult.valid ||
    result.netCents === null ||
    baselineResult.netCents === null
  ) {
    return [];
  }

  const difference = result.netCents - baselineResult.netCents;
  if (difference === 0) return [];

  const lines: string[] = [];
  const money = formatCalculatorMoney(Math.abs(difference));
  const dollarLine =
    difference > 0
      ? `This scenario generates ${money} more in estimated annual tuition revenue.`
      : `This scenario generates ${money} less in estimated annual tuition revenue.`;

  const enrollmentDelta = result.totalStudents - baselineResult.totalStudents;
  const tuitionUnchanged = sameTuitionStructure(scenario.groups, baseline.groups);
  const uniformTuition =
    scenario.groups.length > 0 &&
    scenario.groups.every(
      (group) => group.monthlyTuitionCents === scenario.groups[0]?.monthlyTuitionCents,
    );
  const noGroupShrunk =
    scenario.groups.length === baseline.groups.length &&
    scenario.groups.every(
      (group, index) => group.enrollment >= (baseline.groups[index]?.enrollment ?? 0),
    );

  if (tuitionUnchanged && uniformTuition && noGroupShrunk && enrollmentDelta > 0 && difference > 0) {
    lines.push(
      `${additionalStudentPhrase(enrollmentDelta)} at the current tuition would generate an estimated ${money} more per year.`,
    );
  } else if (
    scenario.groups.length === baseline.groups.length &&
    enrollmentDelta < 0 &&
    result.netCents >= baselineResult.netCents &&
    scenario.groups.every((group, index) => {
      const other = baseline.groups[index];
      if (!other) return false;
      return (
        group.monthlyTuitionCents >= other.monthlyTuitionCents &&
        group.billingMonths === other.billingMonths &&
        adjustmentsInactiveOrEqual(group.siblingDiscount, other.siblingDiscount) &&
        adjustmentsInactiveOrEqual(group.scholarship, other.scholarship)
      );
    }) &&
    scenario.groups.some(
      (group, index) => group.monthlyTuitionCents > (baseline.groups[index]?.monthlyTuitionCents ?? 0),
    )
  ) {
    lines.push(
      enrollmentDelta === -1
        ? "This tuition increase offsets the revenue impact of one fewer student."
        : "This tuition increase offsets the revenue impact of fewer students.",
    );
    lines.push(dollarLine);
  } else {
    lines.push(dollarLine);
  }

  if (lines.length < 2 && result.annualScholarshipCents !== null && result.annualScholarshipCents > 0) {
    const scholarshipLine = `The scholarship assumptions reduce estimated annual tuition revenue by ${formatCalculatorMoney(result.annualScholarshipCents)}.`;
    const scholarshipIsTheWholeDifference =
      difference < 0 &&
      baselineResult.annualScholarshipCents === 0 &&
      result.annualScholarshipCents === Math.abs(difference) &&
      lines[0] === dollarLine;
    if (scholarshipIsTheWholeDifference) {
      lines[0] = scholarshipLine;
    } else if (!lines.includes(scholarshipLine)) {
      lines.push(scholarshipLine);
    }
  }

  return lines.slice(0, 2);
}

export function selectedLiveSummary(
  name: string,
  result: ScenarioComputation,
  comparison: ScenarioComparison,
): string {
  const revenue =
    result.valid && result.netCents !== null
      ? `${formatCalculatorMoney(result.netCents)} estimated annual tuition revenue`
      : "Estimated annual tuition revenue is unavailable until the assumptions are valid";
  return `${name}. ${revenue}. ${comparison.differenceLabel}.`;
}

export function directionWord(direction: ComparisonDirection): string | null {
  if (direction === "higher") return "higher";
  if (direction === "lower") return "lower";
  return null;
}
