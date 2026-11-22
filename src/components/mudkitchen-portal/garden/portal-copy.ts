/**
 * Copy for the MudKitchen account area (/school/[slug]/admin/mudkitchen).
 * Strings carried over word for word from the previous portal design; the
 * `hand` lines are decorative only (rendered aria-hidden).
 */

export const MUDKITCHEN_SUPPORT_EMAIL = "support@trymudkitchen.com";

export const PORTAL_NAV_COPY = {
  ariaLabel: "MudKitchen portal",
  overview: "Overview",
  buildLog: "Build log",
  billing: "Billing",
  backToAdmin: "← School admin",
} as const;

export const OVERVIEW_COPY = {
  pill: "🌱 Your MudKitchen account",
  titleLead: "Everything we're building for",
  subtitle:
    "Build progress and billing for your partnership with MudKitchen — all in one place.",
  hand: "here's where things stand ↓",
  latestUpdate: "Latest update",
  seeFullLog: "See the full build log",
  goToBilling: "Go to billing",
  buildLog: {
    title: "Build log",
    description:
      "Daily progress updates as we build your school's MudKitchen setup.",
  },
  billing: {
    title: "Billing",
    description: "Subscription and invoicing for your MudKitchen account.",
    oneDue: (periodLabel: string) =>
      `Invoice due for ${periodLabel}. Pay via Stripe and mark as paid.`,
    manyDue: (count: number) =>
      `${count} invoices due. Review and mark as paid.`,
  },
} as const;

export const BUILD_LOG_COPY = {
  pill: "🌿 Build progress",
  title: "What we've done so far",
  subtitle: (schoolName: string) =>
    `A running log of the work we're doing for ${schoolName} — updated as we go.`,
  updatesCount: (count: number) =>
    count === 1 ? "1 update" : `${count} updates`,
  currentPhase: "Now in",
  emptyTitle: "No build updates yet",
  emptyBody:
    "Check back soon — we'll post progress here as we work on your MudKitchen setup.",
  emptyHand: "nothing here yet ✿",
} as const;

export const BILLING_COPY = {
  pill: "🧾 Billing",
  title: "Subscription & invoices",
  subtitle:
    "Monthly MudKitchen subscription invoices appear here. Pay via Stripe, then mark as paid once complete.",
  dueEyebrow: "Action needed",
  dueTitle: "Due invoices",
  dueSubtitle: "Pay through Stripe, then mark the invoice as paid.",
  paidEyebrow: "History",
  paidTitle: "Paid invoices",
  paidSubtitle: "A record of completed MudKitchen subscription payments.",
  dueChip: "Due",
  paidChip: "Paid",
  invoiceDueFor: (periodLabel: string) => `Invoice due for ${periodLabel}`,
  paidOn: (date: string) => `Paid ${date}`,
  markedBy: (email: string) => `Marked paid by ${email}`,
  payInvoice: "Pay invoice",
  viewInvoice: "View invoice",
  markAsPaid: "Mark as paid",
  refreshing: "Refreshing invoices…",
  retry: "Retry",
  markFailed: "Failed to mark invoice as paid.",
  markedPaid: "Marked as paid",
  emptyEyebrow: "No invoices yet",
  emptyTitle: "You're all caught up",
  emptyBodyLead:
    "When a MudKitchen invoice is ready, it will show up here. Questions in the meantime? Email us at",
  emptyHand: "all square ✿",
  confirm: {
    eyebrow: "Confirm payment",
    title: "Mark invoice as paid?",
    description: "Only confirm after you've completed payment through Stripe.",
    confirmLabel: "Yes, mark as paid",
    cancelLabel: "Cancel",
    periodLabel: "Billing period",
  },
} as const;
