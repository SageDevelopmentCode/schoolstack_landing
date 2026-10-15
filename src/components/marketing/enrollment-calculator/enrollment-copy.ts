import type { EnrollmentEstimate, MonthlyBreakdown } from "@/lib/marketing/enrollment-calculator";
import {
  formatCalculatorMoney,
  formatStudentCount,
} from "@/lib/marketing/enrollment-calculator";

export const CALCULATOR_COPY = {
  title: "Can your school pay you?",
  subtitle:
    "Find the enrollment you need to cover your costs and pay yourself. Start with your numbers. Then explore what's possible.",
  startFresh: "Start fresh",
  savePrint: "Save / print",
  journey: ["Your numbers", "Your enrollment goal"] as const,
  inputsTitle: "Your numbers",
  inputsSubtitle: "Monthly amounts are all you need. Estimates are fine.",
  groups: {
    tuition: "Tuition & student costs",
    operating: "Keeping the school running",
    pay: "Making room for you",
    today: "Where you are today",
  },
  inputs: {
    tuition: "What do you charge each student?",
    fixedExpenses: "What does it cost to keep the school running?",
    variableCost: "What does each student cost?",
    ownerPay: "How much do you want to pay yourself?",
    currentEnrollment: "How many students do you have today?",
  },
  help: {
    studentCosts: "Student costs include things like supplies and meals.",
    operating:
      "Costs that stay roughly the same as enrollment changes. Exclude your own pay and the student costs above.",
    pay: "The amount you want the school to set aside for your pay.",
    current: "Your current enrollment.",
    fromList: "From your expense list.",
  },
  estimateAction: "Help me estimate these costs",
  editEstimate: "Edit your estimate",
  privacy: "Nothing is sent anywhere. These numbers stay in this browser tab.",
  goalKicker: "Your enrollment goal",
  goalQuestion: "To cover school costs and your pay goal, you need",
  snapshotTitle: "Where you stand today",
  rows: {
    tuition: "Tuition collected",
    studentCosts: "Student costs",
    operating: "School operating costs",
    available: "Available for your pay",
  },
  milestoneCosts: "Cover school costs",
  milestoneCostsHelp: "Before paying yourself.",
  milestonePay: "Cover costs + your pay",
  milestonePayHelp: "Includes your monthly pay goal.",
  scenarioKicker: "Explore a scenario",
  scenarioTitle: "What if enrollment changed?",
  scenarioBody:
    "Try a different student count to see what would be available for your pay. This won't change your current enrollment.",
  scenarioBadge: "What-if only",
  scenarioLabel: "Students in this scenario",
  scenarioTuition: "Total tuition",
  scenarioCosts: "Total school + student costs",
  mathTitle: "How we work out these numbers",
  mathSteps: {
    contribution: "1 · Each student contributes",
    contributionDetail: "Tuition − cost per student",
    costs: "2 · School costs are covered at",
    costsDetail: "School costs ÷ contribution per student",
    pay: "3 · Your pay goal is covered at",
    payDetail: "(School costs + pay goal) ÷ contribution",
  },
  assumptions:
    "Student targets are rounded up to whole students. This simple model assumes every student pays the same monthly tuition and incurs the same student costs, while school operating costs stay fixed. Available for your pay is what remains after those costs; it is not take-home pay or a tax calculation. Add any reserves, employer costs, or other obligations to your inputs if you want them included. More students may require more staff or space, so revisit your school costs as enrollment grows. These are estimates from the numbers you enter. They don't include taxes, unpaid tuition, or costs you didn't enter.",
  blankAnswer: "Add your tuition and expenses to see an enrollment target.",
  tuitionTooLow: "Tuition needs to be higher than the cost of each student.",
  estimateCaveat:
    "These are estimates from the numbers you enter. They don't include taxes, unpaid tuition, or costs you didn't enter.",
  resetKicker: "Start fresh",
  resetTitle: "Reset your numbers?",
  resetBody: "This returns all inputs to the original example. Your current entries will be cleared.",
  keepNumbers: "Keep my numbers",
  resetConfirm: "Reset to example",
  estimateKicker: "School operating costs",
  estimateTitle: "Build a monthly estimate",
  estimateBody:
    "Add costs that don't change with each extra student. Leave out your own pay and the per-student costs already entered. This replaces the operating-cost amount in your calculator.",
  estimateTotal: "Estimated monthly costs",
  useEstimate: "Use this estimate",
  useSingleAmount: "Use a single amount instead",
  close: "Close",
  tuitionPlannerLead: "Comparing a tuition change instead?",
  tuitionPlannerLink: "Tuition planner",
  perMonth: "per month",
  monthSuffix: "/ month",
} as const;

export const ENROLLMENT_WIZARD_DONE_KICKER = "Enrollment goal ready";

export const ENROLLMENT_WIZARD_DONE_TITLE = "You're set";

export const ENROLLMENT_VIEW_RESULTS_BUTTON = "View your results";

export function enrollmentQuestionTuition(): string {
  return CALCULATOR_COPY.inputs.tuition;
}

export function enrollmentQuestionVariable(): string {
  return CALCULATOR_COPY.inputs.variableCost;
}

export function enrollmentQuestionOperating(): string {
  return CALCULATOR_COPY.inputs.fixedExpenses;
}

export function enrollmentQuestionOwnerPay(): string {
  return CALCULATOR_COPY.inputs.ownerPay;
}

export function enrollmentQuestionEnrollmentAll(multiGroup: boolean): string {
  return multiGroup ? "How many students are in each group?" : CALCULATOR_COPY.inputs.currentEnrollment;
}

export function enrollmentDoneTeaser(compensationTarget: number | null): string | null {
  if (compensationTarget === null) return null;
  const label = compensationTarget === 1 ? "1 student" : `${compensationTarget.toLocaleString("en-US")} students`;
  return `To cover school costs and your pay goal, you need ${label}.`;
}

/** Tuition collected, minus student costs and school operating costs. Pay goal is not deducted. */
export function availableForPayCents(breakdown: MonthlyBreakdown): number {
  return breakdown.revenueCents - breakdown.variableCostsCents - breakdown.fixedExpensesCents;
}

export function heroExplain(estimate: EnrollmentEstimate): string {
  if (estimate.contributionCents === 0) {
    return "Tuition equals the cost per student, so additional enrollment does not contribute toward school costs.";
  }
  if (estimate.contributionCents < 0) {
    return "Each student currently costs more than their tuition contributes. Adjust tuition or student costs to create a viable enrollment goal.";
  }
  return `At ${formatCalculatorMoney(estimate.tuitionCents)} tuition, each student contributes ${formatCalculatorMoney(estimate.contributionCents)} after their monthly costs.`;
}

export function todayChip(estimate: EnrollmentEstimate): {
  label: string;
  tone: "success" | "warning" | "alert";
} {
  if (!estimate.viable || estimate.additionalStudents === null) {
    return { label: "Check your numbers", tone: "alert" };
  }
  if (estimate.additionalStudents === 0) {
    return { label: "Goal reached", tone: "success" };
  }
  const count = estimate.additionalStudents.toLocaleString("en-US");
  return {
    label: `${count} student${estimate.additionalStudents === 1 ? "" : "s"} to go`,
    tone: "warning",
  };
}

export function payGapNote(
  payCents: number,
  availableCents: number,
): { text: string; tone: "success" | "warning" | "alert" } {
  if (availableCents < 0) {
    return {
      text: `School costs are short by ${formatCalculatorMoney(-availableCents)} / month, before any pay for you.`,
      tone: "alert",
    };
  }
  const missing = payCents - availableCents;
  if (missing > 0) {
    return {
      text: `You're ${formatCalculatorMoney(missing)} / month short of your ${formatCalculatorMoney(payCents)} pay goal.`,
      tone: "warning",
    };
  }
  if (payCents === 0) {
    return {
      text: `School costs are covered, with ${formatCalculatorMoney(availableCents)} remaining each month.`,
      tone: "success",
    };
  }
  if (availableCents === payCents) {
    return {
      text: "Your school costs and monthly pay goal are covered.",
      tone: "success",
    };
  }
  return {
    text: `Your pay goal is covered, with ${formatCalculatorMoney(availableCents - payCents)} / month remaining.`,
    tone: "success",
  };
}

export function scenarioKicker(availableCents: number, students: number): string {
  const who = `${students.toLocaleString("en-US")} student${students === 1 ? "" : "s"}`;
  if (availableCents < 0) return `School-cost shortfall at ${who}`;
  return `Available for your pay at ${who}`;
}

export function scenarioDescription(availableCents: number, payCents: number): string {
  if (availableCents < 0) {
    return "Tuition doesn't cover school costs yet. There is nothing available for your pay.";
  }
  if (availableCents < payCents) {
    return `That's ${formatCalculatorMoney(payCents - availableCents)} below your monthly pay goal.`;
  }
  if (availableCents === payCents) {
    return "Your school costs and pay goal would be covered.";
  }
  return `Your pay goal would be covered, with ${formatCalculatorMoney(availableCents - payCents)} left over each month.`;
}

export function payGoalCoverage(
  availableCents: number,
  payCents: number,
): { percent: number; note: string } {
  if (payCents <= 0) {
    return {
      percent: availableCents >= 0 ? 100 : 0,
      note: "No monthly pay goal is set.",
    };
  }
  const percent = Math.round(Math.min(100, Math.max(0, (availableCents / payCents) * 100)));
  const above =
    availableCents > payCents
      ? ` · ${formatCalculatorMoney(availableCents - payCents)} above goal`
      : "";
  return {
    percent,
    note: `${percent}% of your monthly pay goal is covered${above}.`,
  };
}

export function formulaContribution(estimate: EnrollmentEstimate): string {
  return `${formatCalculatorMoney(estimate.tuitionCents)} − ${formatCalculatorMoney(estimate.variableCostPerStudentCents)} = ${formatCalculatorMoney(estimate.contributionCents)} / month`;
}

export function formulaStudents(
  amountCents: number,
  contributionCents: number,
  students: number | null,
): string {
  if (students === null || contributionCents <= 0) {
    return "No enrollment target at this contribution";
  }
  return `${formatCalculatorMoney(amountCents)} ÷ ${formatCalculatorMoney(contributionCents)} → ${students.toLocaleString("en-US")} ${students === 1 ? "student" : "students"}`;
}

export function unreachableExplanation(estimate: EnrollmentEstimate): string {
  if (estimate.fixedExpensesCents === 0 && estimate.ownerCompensationCents === 0) {
    return "Enter monthly tuition that's higher than the cost of each student. Until then, there isn't a student target to calculate.";
  }
  if (estimate.contributionCents < 0) {
    const gap = formatCalculatorMoney(Math.abs(estimate.contributionCents));
    return `Each student brings in ${formatCalculatorMoney(estimate.tuitionCents)} and costs ${formatCalculatorMoney(estimate.variableCostPerStudentCents)}, which is ${gap} short before rent, payroll, or your pay. Raise tuition or lower that per-student cost to make an enrollment target possible.`;
  }
  return "Tuition isn't higher than the cost of each student, so another student doesn't help cover your fixed expenses. Raise monthly tuition or lower the per-student cost.";
}

export function enrollmentLiveSummary({
  blank,
  estimate,
  todayAvailableCents,
}: {
  blank: boolean;
  estimate: EnrollmentEstimate;
  todayAvailableCents: number;
}): string {
  if (blank) return CALCULATOR_COPY.blankAnswer;
  if (!estimate.viable || estimate.compensationTarget === null || estimate.additionalStudents === null) {
    return unreachableExplanation(estimate);
  }
  const count = estimate.currentEnrollment.toLocaleString("en-US");
  const students = estimate.currentEnrollment === 1 ? "student" : "students";
  return [
    `${formatStudentCount(estimate.compensationTarget)} to cover school costs and your pay goal.`,
    `With ${count} ${students}, here's your monthly picture.`,
    payGapNote(estimate.ownerCompensationCents, todayAvailableCents).text,
  ].join(" ");
}
