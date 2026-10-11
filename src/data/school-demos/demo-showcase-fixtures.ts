import type {
  ApplicationPostSubmitTask,
  FamilyApplication,
} from "@/lib/admissions/parent-portal-access";
import { FAMILY_TOUR_ACTION_TYPE } from "@/lib/admissions/family-tour-booking";
import type { DemoSubmissionLead } from "@/components/demo/shared/demo-submissions-mapper";
import {
  DEMO_ADMIN_SUBMISSION_LEADS,
} from "@/data/school-demos/demo-admin-admissions-fixtures";
import type { AttendanceRosterResponse } from "@/lib/school-admin/attendance/attendance-types";
import type { ParentBillingInitialData } from "@/lib/tuition/load-parent-billing-data";
import type { ParentTuitionPaymentRecord } from "@/lib/tuition/payments";
import {
  buildDemoMarketingApplyApplications,
  buildDemoParentBillingInitialData,
  buildDemoParentUserProfile,
  DEMO_PARENT_FAMILY_ID,
} from "@/data/school-demos/demo-parent-portal-fixtures";
import { DEMO_PORTAL_ORG_ID } from "@/data/school-demos/demo-portal-shared";
import {
  buildDemoTeacherHoursSummary,
  type DemoTeacherHoursSummary,
} from "@/data/school-demos/demo-teacher-hours-fixtures";
import { buildDemoTeacherAttendanceRoster } from "@/data/school-demos/demo-teacher-portal-fixtures";
import { buildShowcaseTeacherAttendanceRosterStudents } from "@/data/school-demos/demo-teacher-portal-fixtures";

export const DEMO_SHOWCASE_APPLY_LIAM_ID = "demo-showcase-apply-liam";

/** Matches `childKey` on parent billing family summary (not enrollment row ids). */
const DEMO_BILLING_CHILD_EMMA = "demo-student-emma";
const DEMO_BILLING_CHILD_LIAM = "demo-student-liam";

const SHOWCASE_INBOX_LEAD_IDS = [
  "l3",
  "l2",
  "l8",
  "l5",
  "l0",
  "l1",
  "l4",
  "l6",
  "l7",
] as const;

const SHOWCASE_INBOX_EXTRA_LEADS: DemoSubmissionLead[] = [
  {
    id: "showcase-inbox-a",
    name: "Priya Nair",
    email: "pnair@email.com",
    phone: "(512) 555-0244",
    childName: "Anika Nair",
    childAge: null,
    status: "under_review",
    tags: ["Apply Now Form", "2026–27 Enrollment"],
    date: "28 minutes ago",
    message: "Transferring from a Montessori program; strong interest in fine arts.",
    flowId: "flow-1",
    responses: {
      f1: "Priya Nair",
      f2: "pnair@email.com",
      f3: "Anika Nair",
      f4: "3rd Grade",
    },
  },
  {
    id: "showcase-inbox-b",
    name: "Marcus Chen",
    email: "mchen@email.com",
    phone: "(512) 555-0311",
    childName: "Olivia Chen",
    childAge: null,
    status: "new",
    tags: ["Waitlist Signup"],
    date: "1 hour ago",
    message: null,
    flowId: "flow-3",
    responses: {
      f17: "Marcus Chen",
      f18: "mchen@email.com",
      f19: "Olivia Chen",
    },
  },
  {
    id: "showcase-inbox-c",
    name: "Danielle Brooks",
    email: "dbrooks@email.com",
    phone: "(512) 555-0388",
    childName: "Jordan Brooks",
    childAge: null,
    status: "scheduled",
    tags: ["Book a Campus Tour"],
    date: "2 hours ago",
    message: "Hoping to tour before summer programs fill.",
    flowId: "flow-4",
    responses: {
      f25: "Danielle Brooks",
      f26: "dbrooks@email.com",
      f27: "Jordan Brooks",
    },
  },
];

export function buildShowcaseAdmissionsInboxLeads(): DemoSubmissionLead[] {
  const byId = new Map(DEMO_ADMIN_SUBMISSION_LEADS.map((lead) => [lead.id, lead]));
  const core = SHOWCASE_INBOX_LEAD_IDS.map((id) => {
    const lead = byId.get(id);
    if (!lead) {
      throw new Error(`Missing demo submission lead ${id} for showcase inbox`);
    }
    if (id === "l3") {
      return { ...lead, date: "Just now" };
    }
    return lead;
  });
  return [...core, ...SHOWCASE_INBOX_EXTRA_LEADS];
}

function showcaseEmmaPostSubmitTasks(): ApplicationPostSubmitTask[] {
  return [
    {
      actionId: "showcase-campus-tour",
      type: FAMILY_TOUR_ACTION_TYPE as ApplicationPostSubmitTask["type"],
      title: "Schedule a campus tour",
      instructions:
        "Choose a weekday morning or Saturday slot to visit Luff Learning with your child.",
      required: true,
      durationMinutes: 60,
      sortIndex: 0,
      status: "pending" as const,
    },
    {
      actionId: "showcase-family-interview",
      type: "schedule_family_interview",
      title: "Schedule a family interview",
      instructions:
        "Meet with admissions for a 30-minute conversation about fit, learning style, and next steps.",
      required: true,
      durationMinutes: 30,
      sortIndex: 1,
      status: "pending" as const,
    },
    {
      actionId: "showcase-shadow-day",
      type: "schedule_observation_day",
      title: "Book a shadow day",
      instructions:
        "Pick a school day for your child to visit classrooms and meet teachers.",
      required: true,
      durationMinutes: 480,
      maxVisitDays: 1,
      sortIndex: 2,
      status: "pending" as const,
    },
  ];
}

export function buildShowcaseApplyDashboardData(): {
  applications: FamilyApplication[];
  applicationsWithTasks: FamilyApplication[];
  enrollmentProgressByApplicationId: Record<string, never>;
  userProfile: ReturnType<typeof buildDemoParentUserProfile>;
} {
  const emmaBase = buildDemoMarketingApplyApplications()[0];
  const emmaSubmitted: FamilyApplication = {
    ...emmaBase,
    postSubmitTasks: showcaseEmmaPostSubmitTasks(),
  };
  const liamDraft: FamilyApplication = {
    id: DEMO_SHOWCASE_APPLY_LIAM_ID,
    status: "draft",
    submittedAt: null,
    createdAt: "2026-04-02T10:00:00.000Z",
    formTitle: "Apply Now Form",
    publicSlug: "demo-liam-mitchell",
    studentId: "demo-student-liam",
    studentName: "Liam Mitchell",
    grade: "K",
    postSubmitTasks: [],
  };

  const applications = [emmaSubmitted, liamDraft];

  return {
    applications,
    applicationsWithTasks: [emmaSubmitted],
    enrollmentProgressByApplicationId: {},
    userProfile: buildDemoParentUserProfile(),
  };
}

export function buildShowcaseParentBillingInitialData(
  organizationId = DEMO_PORTAL_ORG_ID,
): ParentBillingInitialData {
  const base = buildDemoParentBillingInitialData(organizationId);
  const familyId = DEMO_PARENT_FAMILY_ID;

  const payments: ParentTuitionPaymentRecord[] = [
    {
      id: "demo-showcase-pay-1",
      organizationId,
      applicationId: null,
      familyId,
      tuitionChargeId: "demo-charge-paid-1",
      paymentType: "tuition",
      enrollmentChecklistItemId: null,
      label: "Tuition installment — Emma",
      payerUserId: null,
      stripeCheckoutSessionId: null,
      stripePaymentIntentId: null,
      amountCents: 125000,
      amountAppliedCents: 125000,
      chargedAmountCents: 125750,
      processingFeeCents: 750,
      paymentMethodType: "card",
      currency: "usd",
      status: "succeeded",
      stripeProviderStatus: "succeeded",
      paidAt: "2026-03-01T16:22:00.000Z",
      createdAt: "2026-03-01T16:20:00.000Z",
      studentFirstName: "Emma",
      enrollmentId: DEMO_BILLING_CHILD_EMMA,
    },
    {
      id: "demo-showcase-pay-2",
      organizationId,
      applicationId: null,
      familyId,
      tuitionChargeId: "demo-charge-paid-2",
      paymentType: "tuition",
      enrollmentChecklistItemId: null,
      label: "Registration fee — Emma",
      payerUserId: null,
      stripeCheckoutSessionId: null,
      stripePaymentIntentId: null,
      amountCents: 35000,
      amountAppliedCents: 35000,
      chargedAmountCents: 35000,
      processingFeeCents: 0,
      paymentMethodType: "us_bank_account",
      currency: "usd",
      status: "succeeded",
      stripeProviderStatus: "succeeded",
      paidAt: "2026-02-10T11:05:00.000Z",
      createdAt: "2026-02-10T11:00:00.000Z",
      studentFirstName: "Emma",
      enrollmentId: DEMO_BILLING_CHILD_EMMA,
    },
    {
      id: "demo-showcase-pay-3",
      organizationId,
      applicationId: null,
      familyId,
      tuitionChargeId: "demo-charge-paid-3",
      paymentType: "tuition",
      enrollmentChecklistItemId: null,
      label: "Tuition installment — Liam",
      payerUserId: null,
      stripeCheckoutSessionId: null,
      stripePaymentIntentId: null,
      amountCents: 125000,
      amountAppliedCents: 125000,
      chargedAmountCents: 125000,
      processingFeeCents: 0,
      paymentMethodType: "card",
      currency: "usd",
      status: "succeeded",
      stripeProviderStatus: "succeeded",
      paidAt: "2026-01-15T14:30:00.000Z",
      createdAt: "2026-01-15T14:28:00.000Z",
      studentFirstName: "Liam",
      enrollmentId: DEMO_BILLING_CHILD_LIAM,
    },
    {
      id: "demo-showcase-pay-4",
      organizationId,
      applicationId: null,
      familyId,
      tuitionChargeId: "demo-charge-paid-4",
      paymentType: "tuition",
      enrollmentChecklistItemId: null,
      label: "Materials fee — Emma",
      payerUserId: null,
      stripeCheckoutSessionId: null,
      stripePaymentIntentId: null,
      amountCents: 8500,
      amountAppliedCents: 8500,
      chargedAmountCents: 8500,
      processingFeeCents: 0,
      paymentMethodType: "card",
      currency: "usd",
      status: "succeeded",
      stripeProviderStatus: "succeeded",
      paidAt: "2025-12-05T09:15:00.000Z",
      createdAt: "2025-12-05T09:12:00.000Z",
      studentFirstName: "Emma",
      enrollmentId: DEMO_BILLING_CHILD_EMMA,
    },
    {
      id: "demo-showcase-pay-5",
      organizationId,
      applicationId: null,
      familyId,
      tuitionChargeId: "demo-charge-paid-5",
      paymentType: "tuition",
      enrollmentChecklistItemId: null,
      label: "Tuition installment — Emma",
      payerUserId: null,
      stripeCheckoutSessionId: null,
      stripePaymentIntentId: null,
      amountCents: 125000,
      amountAppliedCents: 125000,
      chargedAmountCents: 125000,
      processingFeeCents: 0,
      paymentMethodType: "us_bank_account",
      currency: "usd",
      status: "succeeded",
      stripeProviderStatus: "succeeded",
      paidAt: "2026-04-01T10:18:00.000Z",
      createdAt: "2026-04-01T10:15:00.000Z",
      studentFirstName: "Emma",
      enrollmentId: DEMO_BILLING_CHILD_EMMA,
    },
    {
      id: "demo-showcase-pay-6",
      organizationId,
      applicationId: null,
      familyId,
      tuitionChargeId: "demo-charge-paid-6",
      paymentType: "tuition",
      enrollmentChecklistItemId: null,
      label: "After-school enrichment — Emma",
      payerUserId: null,
      stripeCheckoutSessionId: null,
      stripePaymentIntentId: null,
      amountCents: 42000,
      amountAppliedCents: 42000,
      chargedAmountCents: 42210,
      processingFeeCents: 210,
      paymentMethodType: "card",
      currency: "usd",
      status: "succeeded",
      stripeProviderStatus: "succeeded",
      paidAt: "2025-11-18T15:40:00.000Z",
      createdAt: "2025-11-18T15:38:00.000Z",
      studentFirstName: "Emma",
      enrollmentId: DEMO_BILLING_CHILD_EMMA,
    },
    {
      id: "demo-showcase-pay-7",
      organizationId,
      applicationId: null,
      familyId,
      tuitionChargeId: "demo-charge-paid-7",
      paymentType: "tuition",
      enrollmentChecklistItemId: null,
      label: "Tuition installment — Emma",
      payerUserId: null,
      stripeCheckoutSessionId: null,
      stripePaymentIntentId: null,
      amountCents: 125000,
      amountAppliedCents: 125000,
      chargedAmountCents: 125750,
      processingFeeCents: 750,
      paymentMethodType: "card",
      currency: "usd",
      status: "succeeded",
      stripeProviderStatus: "succeeded",
      paidAt: "2025-10-05T09:02:00.000Z",
      createdAt: "2025-10-05T09:00:00.000Z",
      studentFirstName: "Emma",
      enrollmentId: DEMO_BILLING_CHILD_EMMA,
    },
  ];

  return {
    ...base,
    payments,
  };
}

export function buildShowcaseTeacherAttendanceRoster(): AttendanceRosterResponse {
  const base = buildDemoTeacherAttendanceRoster();
  const extraStudents = buildShowcaseTeacherAttendanceRosterStudents();
  const students = [...base.students, ...extraStudents];
  const presentCount = students.filter((s) => s.attendanceStatus === "present").length;
  const absentCount = students.filter((s) => s.attendanceStatus === "absent").length;
  const pickedUpCount = students.filter((s) => s.attendanceStatus === "picked_up").length;
  const notMarkedCount = students.filter(
    (s) => s.attendanceStatus === "not_marked",
  ).length;

  return {
    date: base.date,
    students,
    summary: {
      totalStudents: students.length,
      presentCount,
      absentCount,
      pickedUpCount,
      notMarkedCount,
    },
  };
}

export function buildShowcaseTeacherHoursSummary(): DemoTeacherHoursSummary {
  const base = buildDemoTeacherHoursSummary();
  return {
    ...base,
    weekTotalHours: 40.2,
    monthTotalHours: 142.8,
    scheduledWeekHours: 38,
    entries: [
      ...base.entries,
      {
        date: "Fri, May 9",
        clockIn: "7:52 AM",
        clockOut: "3:35 PM",
        hours: 7.7,
      },
      {
        date: "Thu, May 8",
        clockIn: "7:40 AM",
        clockOut: "3:42 PM",
        hours: 8.0,
        note: "Staff meeting",
      },
      {
        date: "Wed, May 7",
        clockIn: "7:45 AM",
        clockOut: "12:15 PM",
        hours: 4.5,
        note: "Half day — professional development",
      },
      {
        date: "Tue, May 6",
        clockIn: "7:43 AM",
        clockOut: "3:50 PM",
        hours: 8.1,
      },
      {
        date: "Mon, May 5",
        clockIn: "7:47 AM",
        clockOut: "3:36 PM",
        hours: 7.8,
      },
      {
        date: "Fri, May 2",
        clockIn: "7:51 AM",
        clockOut: "3:33 PM",
        hours: 7.7,
      },
      {
        date: "Thu, May 1",
        clockIn: "7:39 AM",
        clockOut: "3:44 PM",
        hours: 8.1,
      },
      {
        date: "Wed, Apr 30",
        clockIn: "7:46 AM",
        clockOut: "3:41 PM",
        hours: 7.9,
      },
    ],
  };
}
