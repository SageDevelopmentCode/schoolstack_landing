/**
 * What MudKitchen can honestly offer a school, for outreach snapshots and emails.
 *
 * - `shipped`: in the product today (evidence paths in the comments).
 * - `custom`: work we'd build or set up for a school (CUSTOM_COPY in src/components/home/home-copy.ts).
 *   Snapshots label these "We can set this up for you", and the plan must list them in
 *   `checkBeforeSending` so Julius confirms we'll build it before the email goes out.
 *
 * Inventory taken 2026-11-22. Update it when a module ships or is retired.
 */
import type { DemoWalkthroughStep } from "@/data/school-demos/walkthrough-placeholder";

export type CapabilityKind = "shipped" | "custom";

export const MUDKITCHEN_CAPABILITIES = {
  // ── Website and admissions ────────────────────────────────────────────────
  "website-service": { label: "School website, built for you by MudKitchen", kind: "shipped" }, // done-for-you service (Sage Field)
  "online-application": { label: "Online application with saved drafts", kind: "shipped" }, // src/app/school/[slug]/apply
  "application-fee": { label: "Application fee paid online", kind: "shipped" }, // src/lib/stripe/application-payments.ts
  "tour-self-booking": { label: "Families book a tour from open time slots", kind: "shipped" }, // src/app/school/[slug]/tour
  "observation-booking": { label: "Families book a classroom visit after applying", kind: "shipped" },
  "admissions-pipeline": { label: "Every inquiry and application in one admin inbox", kind: "shipped" },
  "programs-capacity": { label: "Programs marked Open, Waitlist, Full or Closed", kind: "shipped" },
  // ── Enrollment ───────────────────────────────────────────────────────────
  "enrollment-checklist": { label: "Guided enrollment checklist with reminders", kind: "shipped" },
  "enrollment-agreements": { label: "Enrollment agreements signed online (typed signature)", kind: "shipped" },
  "enrollment-fees": { label: "Registration fees and deposits paid in the checklist", kind: "shipped" },
  "forms-documents": { label: "Forms and documents families fill in and sign online", kind: "shipped" },
  // ── Tuition ──────────────────────────────────────────────────────────────
  "tuition-rate-plans": { label: "Tuition plans with installments (monthly, two-pay, annual)", kind: "shipped" },
  "parent-plan-choice": { label: "Families choose their payment plan", kind: "shipped" },
  "parent-billing": { label: "Parent billing page with balance, invoices and history", kind: "shipped" },
  autopay: { label: "Autopay from a saved card or bank account", kind: "shipped" },
  "card-and-ach": { label: "Card and bank (ACH) payments through Stripe", kind: "shipped" },
  discounts: { label: "Discounts, including an automatic sibling discount", kind: "shipped" },
  "split-billing": { label: "Tuition split between two guardians by percentage", kind: "shipped" },
  "late-fees-reminders": { label: "Due-date reminders, invoices and optional late fees", kind: "shipped" },
  // ── Family life ──────────────────────────────────────────────────────────
  messaging: { label: "Two-way messages with families and group broadcasts", kind: "shipped" },
  bulletin: { label: "School announcements feed", kind: "shipped" },
  newsletters: { label: "Newsletters families read on the web and in the app", kind: "shipped" },
  calendar: { label: "School calendar for families", kind: "shipped" },
  photos: { label: "Private photo gallery with photo consent", kind: "shipped" },
  attendance: { label: "Attendance, with check-in and pickup alerts to parents", kind: "shipped" },
  "student-records": { label: "Student and family records, health info and pickup list", kind: "shipped" },
  committees: { label: "Parent committees and volunteer sign-ups", kind: "shipped" },
  "parent-portal": { label: "A private login for each family", kind: "shipped" },
  "mobile-app": { label: "iPhone app for families and staff", kind: "shipped" },
  // ── Custom work (we'd build or set it up) ────────────────────────────────
  "third-party-payer-billing": { label: "Billing part of tuition to a funding program (TEFA, ESA, charter funds)", kind: "custom" },
  "class-billing": { label: "Monthly billing for clubs, after-care or add-on classes", kind: "custom" },
  "learning-plans": { label: "Weekly learning plans for home days", kind: "custom" },
  "calendar-sync": { label: "Calendar that syncs to Google or Apple calendars", kind: "custom" },
  sms: { label: "Text message reminders", kind: "custom" },
  "waitlist-queue": { label: "An ordered waitlist with automatic offers", kind: "custom" },
  "accounting-export": { label: "Export to QuickBooks or a spreadsheet", kind: "custom" },
  "custom-reporting": { label: "Custom reports", kind: "custom" },
  "multi-location": { label: "Several locations in one account", kind: "custom" },
} as const satisfies Record<string, { label: string; kind: CapabilityKind }>;

export type CapabilityId = keyof typeof MUDKITCHEN_CAPABILITIES;

export function isCapabilityId(value: string): value is CapabilityId {
  return Object.prototype.hasOwnProperty.call(MUDKITCHEN_CAPABILITIES, value);
}

export function isCustomCapability(id: CapabilityId): boolean {
  return MUDKITCHEN_CAPABILITIES[id].kind === "custom";
}

/**
 * What a school's demo actually shows, from its walkthrough steps (preview + starting tab).
 * Conservative on purpose: a capability only counts when a step opens the view that shows it.
 */
export function walkthroughCapabilities(steps: readonly DemoWalkthroughStep[]): Set<CapabilityId> {
  const found = new Set<CapabilityId>();
  const add = (...ids: CapabilityId[]) => ids.forEach((id) => found.add(id));

  for (const step of steps) {
    switch (step.preview ?? "website") {
      case "website":
        add("website-service");
        if (step.scrollTarget === "form") add("online-application", "admissions-pipeline");
        break;
      case "application":
        add("online-application", "application-fee");
        break;
      case "observation":
        add("observation-booking");
        break;
      case "admin":
        if (step.initialAdmissionsTab === "submissions" || step.animateNewSubmission) add("admissions-pipeline");
        if (step.autoSendEnrollmentLink) add("enrollment-checklist");
        if (step.initialMySchoolTab === "tuition") add("tuition-rate-plans", "discounts");
        if (step.initialMySchoolTab === "students") add("student-records");
        if (step.initialMySchoolTab === "programs") add("programs-capacity");
        if (step.initialAdminPage === "committees") add("committees");
        break;
      case "parent":
        add("parent-portal");
        if (step.initialParentTab === "enrollment") add("enrollment-checklist", "enrollment-agreements", "enrollment-fees");
        if (step.initialParentTab === "billing") add("parent-billing", "autopay", "card-and-ach", "parent-plan-choice");
        if (step.initialParentTab === "committees") add("committees");
        break;
      case "teacher": {
        const tab = step.initialTeacherTab;
        if (tab === "attendance") add("attendance");
        if (tab === "messages") add("messaging");
        if (tab === "calendar") add("calendar");
        if (tab === "students") add("student-records");
        if (tab === "forms") add("forms-documents");
        if (tab === "feed") add("photos");
        break;
      }
      case "mobile":
        add("mobile-app");
        break;
      default:
        break;
    }
  }
  return found;
}
