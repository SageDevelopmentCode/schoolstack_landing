import {
  AlertTriangle,
  Camera,
  ClipboardList,
  CreditCard,
  FileText,
  Heart,
  Pill,
  ShieldCheck,
  UserPlus,
  Users,
} from "lucide-react";
import type {
  ChildProfileData,
  FamilyChildOverview,
  FamilyUserProfile,
} from "@/lib/admissions/parent-portal-access";
import {
  defaultApplicationFormFeeConfig,
  emptyApplicationFormSchema,
} from "@/lib/admissions/application-form-schema";
import type {
  DemoParentChecklistItem,
  DemoParentChildId,
  DemoParentChildNavItem,
} from "@/components/demo/shared/demo-parent-types";
import type { OrganizationEvent } from "@/lib/school-events/types";
import type { ParentBillingInitialData } from "@/lib/tuition/load-parent-billing-data";
import type { ParentBillingPageMeta } from "@/lib/tuition/parent-billing-page-meta";
import { DEMO_PORTAL_ORG_ID } from "@/data/school-demos/demo-portal-shared";

export const DEMO_PARENT_FAMILY_ID = "demo-parent-family";
export const DEMO_PARENT_GUARDIAN_ID = "demo-parent-guardian";

const DEMO_APP_EMMA = "demo-app-emma";
const DEMO_APP_JAKE = "demo-app-jake";
const DEMO_APP_LIAM = "demo-app-liam";
const DEMO_STUDENT_EMMA = "demo-student-emma";
const DEMO_STUDENT_JAKE = "demo-student-jake";
const DEMO_STUDENT_LIAM = "demo-student-liam";

export const DEMO_PARENT_CHILD_NAV: DemoParentChildNavItem[] = [
  { id: "emma", name: "Emma Mitchell" },
  { id: "jake", name: "Jake Mitchell" },
  { id: "liam", name: "Liam Mitchell" },
];

export const DEMO_PARENT_CHECKLIST_ITEMS: DemoParentChecklistItem[] = [
  { id: 1, label: "Program Description & Key Policies", icon: FileText, required: true, modal: "contract-1", optional: false },
  { id: 2, label: "Community Agreement", icon: Users, required: true, modal: "contract-2", optional: false },
  { id: 3, label: "Emergency Contact, Health & Immunization Form", icon: Heart, required: true, modal: "health-form", optional: false },
  { id: 4, label: "Emergency Medication Plan", icon: Pill, required: false, modal: "medication-plan", optional: true },
  { id: 5, label: "Proof of Immunizations", icon: ShieldCheck, required: true, modal: "immunization", optional: false },
  { id: 6, label: "Health Information Form", icon: ClipboardList, required: true, modal: "health-statement", optional: false },
  { id: 7, label: "Photo Release Form", icon: Camera, required: true, modal: "photo-release", optional: false },
  { id: 8, label: "Assumption of Risk", icon: AlertTriangle, required: true, modal: "assumption-of-risk", optional: false },
  { id: 9, label: "Additional Authorized Pickup", icon: UserPlus, required: false, modal: "authorized-pickup", optional: true },
  { id: 10, label: "Pay Registration Fee", icon: CreditCard, required: true, modal: "registration-fee", optional: false },
];

/** Emma: most required steps complete; Jake: pending review; Liam: enrolled. */
export const DEMO_PARENT_ENROLLMENT_COMPLETIONS: Record<DemoParentChildId, boolean[]> = {
  emma: [true, true, true, false, true, true, true, true, false, false],
  jake: [false, false, false, false, false, false, false, false, false, false],
  liam: [true, true, true, true, true, true, true, true, true, true],
};

export function buildDemoParentUserProfile(): FamilyUserProfile {
  return {
    email: "sarah.mitchell@example.com",
    displayName: "Sarah Mitchell",
    profilePhotoUrl: null,
  };
}

export function buildDemoParentChildren(): FamilyChildOverview[] {
  return [
    {
      applicationId: DEMO_APP_EMMA,
      studentId: DEMO_STUDENT_EMMA,
      studentName: "Emma Mitchell",
      profilePhotoUrl: "/images/people/students/cristina-anne-costello-i8n-TbgzSUE-unsplash-thumb.webp",
      grade: "Elementary",
      status: "enrolled",
      statusLabel: "Enrolled",
      isEnrolled: true,
      checklistProgress: { completed: 7, total: 8 },
      enrolledPrograms: [],
    },
    {
      applicationId: DEMO_APP_JAKE,
      studentId: DEMO_STUDENT_JAKE,
      studentName: "Jake Mitchell",
      profilePhotoUrl: "/images/people/students/ibrahim-guetar-NUkjka_RqUE-unsplash-thumb.webp",
      grade: "Pre-K",
      status: "pending",
      statusLabel: "Under review",
      isEnrolled: false,
      checklistProgress: null,
      enrolledPrograms: [],
    },
    {
      applicationId: DEMO_APP_LIAM,
      studentId: DEMO_STUDENT_LIAM,
      studentName: "Liam Mitchell",
      profilePhotoUrl: "/images/people/students/vitaly-gariev-_z2Ii760I38-unsplash-thumb.webp",
      grade: "Kindergarten",
      status: "enrolled",
      statusLabel: "Enrolled",
      isEnrolled: true,
      checklistProgress: { completed: 10, total: 10 },
      enrolledPrograms: [],
    },
  ];
}

function buildChildProfile(input: {
  applicationId: string;
  studentId: string;
  studentName: string;
  grade: string;
  formTitle: string;
}): ChildProfileData {
  const [firstName, ...rest] = input.studentName.split(" ");
  return {
    application: {
      id: input.applicationId,
      status: "enrolled",
      submittedAt: "2026-01-15T12:00:00.000Z",
      formTitle: input.formTitle,
      schema: emptyApplicationFormSchema(),
      feeConfig: defaultApplicationFormFeeConfig(),
      feeStatus: "paid",
      stepIndex: 0,
      responses: {
        student_first_name: firstName,
        student_last_name: rest.join(" ") || "Mitchell",
        grade: input.grade,
      },
      acknowledgments: {},
      postSubmitSteps: [],
      studentId: input.studentId,
      profilePhotoUrl: null,
    },
    checklist: null,
    assignedTeachers: [
      {
        id: "demo-teacher-1",
        name: "Ms. Taylor Reyes",
        roleTitle: "Lead Teacher",
        profilePhotoUrl: null,
      },
    ],
  };
}

export function buildDemoParentChildProfiles(): Record<string, ChildProfileData> {
  return {
    [DEMO_APP_EMMA]: buildChildProfile({
      applicationId: DEMO_APP_EMMA,
      studentId: DEMO_STUDENT_EMMA,
      studentName: "Emma Mitchell",
      grade: "Elementary",
      formTitle: "Elementary application",
    }),
    [DEMO_APP_JAKE]: buildChildProfile({
      applicationId: DEMO_APP_JAKE,
      studentId: DEMO_STUDENT_JAKE,
      studentName: "Jake Mitchell",
      grade: "Pre-K",
      formTitle: "Pre-K application",
    }),
    [DEMO_APP_LIAM]: buildChildProfile({
      applicationId: DEMO_APP_LIAM,
      studentId: DEMO_STUDENT_LIAM,
      studentName: "Liam Mitchell",
      grade: "Kindergarten",
      formTitle: "Kindergarten application",
    }),
  };
}

export function buildDemoParentEvents(
  organizationId = DEMO_PORTAL_ORG_ID,
): OrganizationEvent[] {
  return [
    {
      id: "demo-event-1",
      organizationId,
      title: "Spring art showcase",
      date: "2026-04-25",
      time: "10:00",
      endTime: "14:00",
      isAllDay: false,
      type: "community",
      colorKey: "emerald",
      location: "Fine Arts Hall",
      sortOrder: 0,
    },
    {
      id: "demo-event-2",
      organizationId,
      title: "Parent coffee morning",
      date: "2026-05-02",
      time: "08:30",
      isAllDay: false,
      type: "community",
      colorKey: "olive",
      location: "Community room",
      sortOrder: 1,
    },
    {
      id: "demo-event-3",
      organizationId,
      title: "Field trip — botanical garden",
      date: "2026-05-09",
      time: "09:00",
      endTime: "15:00",
      isAllDay: false,
      type: "field_trip",
      colorKey: "amber",
      location: "City Botanical Garden",
      sortOrder: 2,
    },
  ];
}

export function buildDemoParentBillingPageMeta(): ParentBillingPageMeta {
  return {
    balanceDueCents: 125000,
    totalRemainingCents: 450000,
    nextDueDate: "2026-05-15",
    nextDueAmountCents: 125000,
    openChargeCount: 2,
    paymentCount: 3,
    hasBillingSplit: false,
  };
}

export function buildDemoParentBillingInitialData(
  organizationId = DEMO_PORTAL_ORG_ID,
): ParentBillingInitialData {
  const now = "2026-04-18T12:00:00.000Z";
  const familyId = DEMO_PARENT_FAMILY_ID;
  const dueDate = "2026-05-15";

  const charges: ParentBillingInitialData["charges"] = [
    {
      id: "demo-charge-1",
      organizationId,
      assignmentId: "demo-assignment-1",
      familyId,
      guardianId: DEMO_PARENT_GUARDIAN_ID,
      label: "Tuition installment — Emma",
      baseAmountCents: 125000,
      amountCents: 125000,
      paidCents: 0,
      currency: "usd",
      dueDate,
      status: "sent",
      chargeType: "tuition",
      installmentNumber: 2,
      metadata: { guardianId: DEMO_PARENT_GUARDIAN_ID },
      sentAt: now,
      paidAt: null,
      createdAt: now,
      updatedAt: now,
    },
    {
      id: "demo-charge-2",
      organizationId,
      assignmentId: "demo-assignment-2",
      familyId,
      guardianId: DEMO_PARENT_GUARDIAN_ID,
      label: "Activity fee — Liam",
      baseAmountCents: 7500,
      amountCents: 7500,
      paidCents: 0,
      currency: "usd",
      dueDate: "2026-06-01",
      status: "scheduled",
      chargeType: "fee",
      installmentNumber: null,
      metadata: {},
      sentAt: null,
      paidAt: null,
      createdAt: now,
      updatedAt: now,
    },
  ];

  const meta = buildDemoParentBillingPageMeta();

  return {
    charges,
    allFamilyCharges: charges,
    payments: [],
    adjustments: [],
    readiness: {
      state: "ready",
      unassignedEnrollments: [],
      pendingPaymentPlanAssignments: [],
      enrollmentChecklistHref: null,
      firstChargeDue: {
        date: dueDate,
        amountCents: 125000,
        label: "Tuition installment — Emma",
      },
      childrenNames: ["Emma Mitchell", "Liam Mitchell"],
    },
    familySummary: {
      balanceDueCents: meta.balanceDueCents,
      totalRemainingCents: meta.totalRemainingCents,
      familyTotalRemainingCents: meta.totalRemainingCents,
      annualTuitionCents: 900000,
      hasPendingSchedule: false,
      nextCharge: {
        label: "Tuition installment — Emma",
        dueDate,
        amountCents: 125000,
      },
      children: [
        {
          childKey: DEMO_STUDENT_EMMA,
          studentName: "Emma Mitchell",
          assignmentId: "demo-assignment-1",
          annualTuitionCents: 450000,
          balanceDueCents: 125000,
          totalRemainingCents: 225000,
          nextCharge: {
            label: "Tuition installment — Emma",
            dueDate,
            amountCents: 125000,
          },
          nextChargeId: "demo-charge-1",
          status: "ready",
          selectionItem: null,
          paymentPlanLabel: "10-month plan",
        },
        {
          childKey: DEMO_STUDENT_LIAM,
          studentName: "Liam Mitchell",
          assignmentId: "demo-assignment-2",
          annualTuitionCents: 450000,
          balanceDueCents: 0,
          totalRemainingCents: 225000,
          nextCharge: null,
          nextChargeId: null,
          status: "ready",
          selectionItem: null,
          paymentPlanLabel: "10-month plan",
        },
      ],
    },
    autopayEnabled: false,
    savedPaymentMethod: null,
    recentAutopayFailure: null,
    guardianId: DEMO_PARENT_GUARDIAN_ID,
    hasBillingSplit: false,
    initialChildKey: DEMO_STUDENT_EMMA,
    showTaxCreditPaymentBanner: false,
    tuitionAgreements: [],
  };
}

export const DEMO_PARENT_ENROLLMENT_DETAIL_COPY: Record<string, { title: string; body: string }> = {
  "contract-1": {
    title: "Program Description & Key Policies",
    body: "Review the program overview, attendance expectations, and community guidelines for Luff Learning Fine Arts Academy.",
  },
  "contract-2": {
    title: "Community Agreement",
    body: "Read and acknowledge the community standards that help us create a safe, creative learning environment.",
  },
  "health-form": {
    title: "Emergency Contact, Health & Immunization Form",
    body: "Provide emergency contacts, allergy information, and immunization records for your child.",
  },
  "medication-plan": {
    title: "Emergency Medication Plan",
    body: "Optional: document any medications that may need to be administered during school hours.",
  },
  immunization: {
    title: "Proof of Immunizations",
    body: "Upload current immunization records or a signed exemption form.",
  },
  "photo-release": {
    title: "Photo Release Form",
    body: "Choose how your child's image may be used in school communications and showcases.",
  },
  "assumption-of-risk": {
    title: "Assumption of Risk",
    body: "Acknowledge the nature of arts and outdoor activities included in the program.",
  },
  "authorized-pickup": {
    title: "Additional Authorized Pickup",
    body: "List adults who are approved to pick up your child from school.",
  },
  "health-statement": {
    title: "Health Information Form",
    body: "Confirm your child's general health status and any accommodations needed.",
  },
  "registration-fee": {
    title: "Pay Registration Fee",
    body: "Complete the one-time registration fee to secure your child's spot.",
  },
};
