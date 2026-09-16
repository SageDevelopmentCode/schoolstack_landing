import type { DemoParentChildId } from "@/components/demo/shared/demo-parent-types";

export type DemoPaymentPlan = "monthly" | "upfront";

export type DemoParentTransaction = {
  id: string;
  desc: string;
  amount: string;
  date: string;
  status: "paid" | "pending";
  childId: DemoParentChildId;
  kind?: "standard" | "homeschool_dropin" | "school_year_tuition";
  scheduleNote?: string;
  schoolYearMonthId?: string;
};

export const DEMO_PARENT_SCHOOL_YEAR_LABEL = "School Year 2026–27";
export const DEMO_PARENT_BILLING_BANNER_SCHOOL_YEAR = "/images/stock/ImageFive.jpg";
export const DEMO_PARENT_BILLING_BANNER_HOMESCHOOL = "/images/stock/Homeschool2.jpg";
export const DEMO_PARENT_SCHOOL_YEAR_MONTHLY_TUITION = 1700;
export const DEMO_PARENT_SCHOOL_YEAR_UPFRONT_TUITION = 17000;
export const EMMA_SCHOOL_YEAR_TX_ID = "emma-school-year-tuition";
export const LIAM_SCHOOL_YEAR_TX_ID = "liam-school-year-tuition";
export const JAKE_HOMESCHOOL_DROPIN_TX_ID = "jake-homeschool-dropin";

export const DEMO_PARENT_SCHOOL_YEAR_MONTHS = [
  { id: "aug-2026", label: "August 2026", short: "Aug" },
  { id: "sep-2026", label: "September 2026", short: "Sep" },
  { id: "oct-2026", label: "October 2026", short: "Oct" },
  { id: "nov-2026", label: "November 2026", short: "Nov" },
  { id: "dec-2026", label: "December 2026", short: "Dec" },
  { id: "jan-2027", label: "January 2027", short: "Jan" },
  { id: "feb-2027", label: "February 2027", short: "Feb" },
  { id: "mar-2027", label: "March 2027", short: "Mar" },
  { id: "apr-2027", label: "April 2027", short: "Apr" },
  { id: "may-2027", label: "May 2027", short: "May" },
] as const;

/** Demo baseline: Aug–Nov already paid before the current billing period. */
export const DEMO_PARENT_SCHOOL_YEAR_MONTHS_PAID = 4;

export const DEMO_PARENT_CHILD_BILLING_META: Record<
  DemoParentChildId,
  { name: string; initials: string; color: string }
> = {
  emma: { name: "Emma", initials: "EM", color: "#7FA888" },
  jake: { name: "Jake", initials: "JM", color: "#f29a8f" },
  liam: { name: "Liam", initials: "LM", color: "#a78bfa" },
};

export const DEMO_PARENT_CHILD_IDS: DemoParentChildId[] = ["emma", "jake", "liam"];

export const DEMO_PARENT_TRANSACTIONS: DemoParentTransaction[] = [
  {
    id: "t1",
    desc: "Registration Fee — Emma Mitchell",
    amount: "$75.00",
    date: "Mar 15, 2026",
    status: "paid",
    childId: "emma",
  },
  {
    id: EMMA_SCHOOL_YEAR_TX_ID,
    desc: "May 2026 Tuition",
    amount: "$0.00",
    date: "May 1, 2026",
    status: "pending",
    childId: "emma",
    kind: "school_year_tuition",
  },
  {
    id: LIAM_SCHOOL_YEAR_TX_ID,
    desc: "May 2026 Tuition",
    amount: "$0.00",
    date: "May 1, 2026",
    status: "pending",
    childId: "liam",
    kind: "school_year_tuition",
  },
  {
    id: JAKE_HOMESCHOOL_DROPIN_TX_ID,
    desc: "Homeschool Drop-In",
    amount: "$0.00",
    date: "Apr 18, 2026",
    status: "pending",
    childId: "jake",
    kind: "homeschool_dropin",
  },
  {
    id: "t4",
    desc: "After-Care — April",
    amount: "$180.00",
    date: "Apr 1, 2026",
    status: "paid",
    childId: "emma",
  },
  {
    id: "t-paid-nov-emma",
    desc: "November 2026 Tuition",
    amount: "$450.00",
    date: "Nov 1, 2026",
    status: "paid",
    childId: "emma",
    kind: "school_year_tuition",
    schoolYearMonthId: "nov-2026",
  },
  {
    id: "t-paid-nov-liam",
    desc: "November 2026 Tuition",
    amount: "$450.00",
    date: "Nov 1, 2026",
    status: "paid",
    childId: "liam",
    kind: "school_year_tuition",
    schoolYearMonthId: "nov-2026",
  },
  {
    id: "t-paid-oct-emma",
    desc: "October 2026 Tuition",
    amount: "$450.00",
    date: "Oct 1, 2026",
    status: "paid",
    childId: "emma",
    kind: "school_year_tuition",
    schoolYearMonthId: "oct-2026",
  },
  {
    id: "t-paid-oct-liam",
    desc: "October 2026 Tuition",
    amount: "$450.00",
    date: "Oct 1, 2026",
    status: "paid",
    childId: "liam",
    kind: "school_year_tuition",
    schoolYearMonthId: "oct-2026",
  },
  {
    id: "t-paid-sep-emma",
    desc: "September 2026 Tuition",
    amount: "$450.00",
    date: "Sep 1, 2026",
    status: "paid",
    childId: "emma",
    kind: "school_year_tuition",
    schoolYearMonthId: "sep-2026",
  },
  {
    id: "t-paid-aug-emma",
    desc: "August 2026 Tuition",
    amount: "$450.00",
    date: "Aug 1, 2026",
    status: "paid",
    childId: "emma",
    kind: "school_year_tuition",
    schoolYearMonthId: "aug-2026",
  },
  {
    id: "t-paid-aug-liam",
    desc: "August 2026 Tuition",
    amount: "$450.00",
    date: "Aug 1, 2026",
    status: "paid",
    childId: "liam",
    kind: "school_year_tuition",
    schoolYearMonthId: "aug-2026",
  },
];

export function isDemoHomeschoolDropIn(t: DemoParentTransaction): boolean {
  return t.kind === "homeschool_dropin";
}

export function isDemoSchoolYearTuition(t: DemoParentTransaction): boolean {
  return t.kind === "school_year_tuition";
}

export function formatDemoMoney(amount: number): string {
  return `$${amount.toFixed(2)}`;
}

export function getDemoSchoolYearAmount(plan: DemoPaymentPlan): number {
  return plan === "monthly"
    ? DEMO_PARENT_SCHOOL_YEAR_MONTHLY_TUITION
    : DEMO_PARENT_SCHOOL_YEAR_UPFRONT_TUITION;
}

export function getDemoSchoolYearDescription(plan: DemoPaymentPlan): string {
  return plan === "monthly"
    ? "May 2026 Tuition"
    : `${DEMO_PARENT_SCHOOL_YEAR_LABEL} Tuition`;
}

export function getDemoPaidTransactionsForMonth(
  paid: DemoParentTransaction[],
  monthId: string,
  checkoutMonthId?: string,
): DemoParentTransaction[] {
  return paid.filter((t) => {
    if (t.schoolYearMonthId === monthId) return true;
    if (
      checkoutMonthId &&
      monthId === checkoutMonthId &&
      isDemoSchoolYearTuition(t) &&
      !t.schoolYearMonthId
    ) {
      return true;
    }
    return false;
  });
}

export function getDemoOtherPaidTransactions(
  paid: DemoParentTransaction[],
): DemoParentTransaction[] {
  return paid.filter((t) => !t.schoolYearMonthId);
}

export function getDemoPendingBanner(t: DemoParentTransaction): string {
  return isDemoHomeschoolDropIn(t)
    ? DEMO_PARENT_BILLING_BANNER_HOMESCHOOL
    : DEMO_PARENT_BILLING_BANNER_SCHOOL_YEAR;
}

export function parseDemoAmount(amount: string): number {
  return parseFloat(amount.replace("$", "").replace(",", ""));
}

export function resolveDemoBillingSubtitle(
  pendingCount: number,
  totalDue: number,
): string {
  const paymentLabel =
    pendingCount === 1 ? "1 payment remaining" : `${pendingCount} payments remaining`;
  if (totalDue > 0) {
    return `${paymentLabel} · ${formatDemoMoney(totalDue)} left this school year`;
  }
  if (pendingCount > 0) {
    return paymentLabel;
  }
  return "Your tuition schedule is up to date";
}
