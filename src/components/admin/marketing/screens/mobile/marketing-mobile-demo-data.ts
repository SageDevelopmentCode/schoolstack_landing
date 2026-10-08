import { MARKETING_MOBILE_DATE_LABEL } from "@/components/admin/marketing/screens/mobile/marketing-mobile-theme";

export const MITCHELL_FAMILY = {
  parentFirstName: "Sarah",
  greeting: "Good morning, Sarah. ☀️",
  dateLabel: MARKETING_MOBILE_DATE_LABEL,
} as const;

export const TUITION_DEMO = {
  nextPaymentAmount: "$1,250",
  nextPaymentCentsLabel: "$1,250",
  dueLabel: "May 15",
  remainingLabel: "$4,500",
  openChargeCount: 2,
  subtitle: "2 payments remaining · $4,500 left this school year",
  payButtonLabel: "Pay $1,250",
} as const;

export const HOME_ATTENTION_ITEMS = [
  {
    id: "enrollment",
    title: "Emma's enrollment is almost done",
    detail: "7 of 8 required steps complete",
    urgent: false,
  },
  {
    id: "tuition",
    title: "Tuition due May 15",
    detail: "$1,250 for Emma Mitchell",
    urgent: true,
  },
] as const;

export const HOME_CHILDREN = [
  { name: "Emma", detail: "Grade 3 · Enrolled" },
  { name: "Liam", detail: "Grade 1 · Enrolled" },
] as const;

export const HOME_START_HERE_HEADLINE = "2 things need your attention";

export const HOME_EVENT = {
  title: "Spring art showcase",
  date: "Saturday, Apr 25",
  calendarLinkLabel: "View family calendar",
} as const;

export const BILLING_PAYMENT_SETTINGS = {
  autopayHeading: "Autopay is off",
  autopayBody: "Turn on automatic payments and we'll process each scheduled tuition payment on its due date.",
  paymentMethodLabel: "Payment method",
  paymentMethodAction: "Visa ···4242 →",
  autopayButtonLabel: "Turn on autopay",
} as const;

export const BILLING_UPCOMING_CHARGES = [
  { id: "may-emma", label: "May tuition", student: "Emma", amount: "$1,250", due: "Due May 15" },
  { id: "june-emma", label: "June tuition", student: "Emma", amount: "$1,250", due: "Due Jun 15" },
] as const;

export const BILLING_PAYMENT_HISTORY = [
  { id: "apr-emma", label: "April tuition", date: "Apr 12, 2026", amount: "$1,250", status: "Succeeded" },
  { id: "enroll", label: "Enrollment deposit", date: "Mar 3, 2026", amount: "$500", status: "Succeeded" },
] as const;

export const BILLING_PILL_NAV = [
  { key: "family", label: "Family view" },
  { key: "emma", label: "Emma" },
  { key: "liam", label: "Liam" },
  { key: "forms", label: "Forms" },
] as const;

export const BILLING_BY_STUDENT = [
  { name: "Emma Mitchell", detail: "May tuition · due May 15", amount: "$1,250", due: true },
  { name: "Liam Mitchell", detail: "Paid through May", amount: "$0 due", due: false },
] as const;

export const TRANSACTIONS_META = {
  totalCount: 24,
  subtitle: "24 payments recorded across application, enrollment, and tuition fees.",
} as const;

export const TRANSACTIONS_METRICS = [
  { value: "$12,400", label: "Collected this month", accent: "#315E4F" },
  { value: "2 · $1,325", label: "Pending", accent: "#E4BD65" },
  { value: "0", label: "Failed", accent: "#B66A83" },
  { value: "1 · $500", label: "Refunded", accent: "#8ABAC6" },
] as const;

export const TRANSACTION_STATUS_FILTERS = ["All", "Pending", "Succeeded", "Failed"] as const;

export const TRANSACTION_TYPE_FILTERS = ["All", "Application", "Enrollment", "Tuition"] as const;

export const ADMISSIONS_ACTIVE_COUNT = 12;

export const ADMISSIONS_SUBTITLE = `${ADMISSIONS_ACTIVE_COUNT} active applications in your pipeline.`;

export const ADMISSIONS_METRICS = [
  { value: 12, label: "All applications", accent: "#315E4F" },
  { value: 3, label: "In progress", accent: "#8ABAC6" },
  { value: 2, label: "Ready to review", accent: "#E4BD65" },
  { value: 47, label: "Enrolled learners", accent: "#B66A83" },
] as const;

export const ADMISSIONS_NEEDS_ATTENTION = {
  guardianName: "Sarah Mitchell",
  submittedLabel: " · Submitted Apr 18",
  reviewButtonLabel: "Review Sarah →",
  copy: "Sarah Mitchell's completed application is ready for your review · Submitted Apr 18.",
} as const;

export const ADMISSIONS_STATUS_FILTERS = [
  "All · 12",
  "Applying · 3",
  "Enrolling · 4",
  "Enrolled · 47",
  "Withdrawn · 1",
] as const;

export type MarketingAdmissionsSubmissionRow = {
  id: string;
  studentName: string;
  contactLine: string;
  initials: string;
  statusLabel: string;
  statusTone: "success" | "pending" | "info";
  programLabel: string;
  metaLine: string;
  nextStepLabel?: string;
  nextStepTone?: "success" | "pending" | "info";
};

export const ADMISSIONS_SUBMISSION_ROWS: MarketingAdmissionsSubmissionRow[] = [
  {
    id: "emma",
    studentName: "Emma Mitchell",
    contactLine: "Sarah Mitchell · sarah.mitchell@email.com",
    initials: "EM",
    statusLabel: "Submitted · ready for review",
    statusTone: "pending",
    programLabel: "Lower School",
    metaLine: "Application complete · 2h ago",
    nextStepLabel: "Review application",
    nextStepTone: "info",
  },
  {
    id: "marcus",
    studentName: "Marcus Webb",
    contactLine: "James Webb · jwebb@email.com",
    initials: "MW",
    statusLabel: "Enrolling · 5 of 8 steps",
    statusTone: "info",
    programLabel: "Middle School",
    metaLine: "Enrollment checklist in progress · 1d ago",
    nextStepLabel: "Review health form",
    nextStepTone: "pending",
  },
];

export const ADMISSIONS_DETAIL = {
  studentName: "Emma Mitchell",
  statusLabel: "Submitted · ready for review",
  statusTone: "pending" as const,
  guardianLine: "Sarah Mitchell · sarah.mitchell@email.com",
  programLabel: "Lower School · 2026–27",
  formTitle: "General application",
  submittedAt: "Apr 18, 2026",
  nextStepLabel: "Review application",
  nextStepTone: "info" as const,
} as const;

export const TRANSACTION_ROWS = [
  {
    title: "May tuition — Emma Mitchell",
    amount: "$1,250",
    status: "Succeeded",
    statusTone: "success" as const,
    type: "Tuition",
    meta: "sarah.mitchell@email.com · Card · 2d ago",
  },
  {
    title: "Enrollment deposit — Mitchell family",
    amount: "$500",
    status: "Succeeded",
    statusTone: "success" as const,
    type: "Enrollment",
    meta: "sarah.mitchell@email.com · ACH · 1w ago",
  },
  {
    title: "Application fee",
    amount: "$75",
    status: "Pending",
    statusTone: "pending" as const,
    type: "Application",
    meta: "sarah.mitchell@email.com · Card · 3d ago",
  },
  {
    title: "April tuition — Liam Mitchell",
    amount: "$1,250",
    status: "Succeeded",
    statusTone: "success" as const,
    type: "Tuition",
    meta: "sarah.mitchell@email.com · Card · 3w ago",
  },
] as const;
