import type {
  ChildProfileData,
  FamilyChildOverview,
  FamilyUserProfile,
} from "@/lib/admissions/parent-portal-access";
import {
  defaultApplicationFormFeeConfig,
  emptyApplicationFormSchema,
} from "@/lib/admissions/application-form-schema";
import type { ParentCommitteesInitialData } from "@/lib/committees/load-parent-committees-data";
import type { MessageThreadSummary } from "@/lib/messages/types";
import type { OrganizationEvent } from "@/lib/school-events/types";
import type { ParentBillingInitialData } from "@/lib/tuition/load-parent-billing-data";
import type { ParentBillingPageMeta } from "@/lib/tuition/parent-billing-page-meta";

export const PROGRAM_PARENT_PORTAL_PREVIEW_FAMILY_ID = "preview-family-id";
export const PROGRAM_PARENT_PORTAL_PREVIEW_GUARDIAN_ID = "preview-guardian-id";

export function isProgramParentPortalPreviewFamilyId(familyId: string): boolean {
  return familyId === PROGRAM_PARENT_PORTAL_PREVIEW_FAMILY_ID;
}

export function getProgramParentPortalPreviewUserProfile(): FamilyUserProfile {
  return {
    email: "alex.morgan@example.com",
    displayName: "Alex Morgan",
    profilePhotoUrl: null,
  };
}

export function getProgramParentPortalPreviewChildren(): FamilyChildOverview[] {
  return [
    {
      applicationId: "preview-app-1",
      studentId: "preview-student-1",
      studentName: "Jordan Morgan",
      profilePhotoUrl: null,
      grade: "Kindergarten",
      status: "enrolled",
      statusLabel: "Enrolled",
      isEnrolled: true,
      checklistProgress: { completed: 8, total: 10 },
      enrolledPrograms: [],
    },
    {
      applicationId: "preview-app-2",
      studentId: "preview-student-2",
      studentName: "Sam Morgan",
      profilePhotoUrl: null,
      grade: "3rd grade",
      status: "enrolled",
      statusLabel: "Enrolled",
      isEnrolled: true,
      checklistProgress: null,
      enrolledPrograms: [],
    },
  ];
}

export function getProgramParentPortalPreviewEvents(
  organizationId: string,
): OrganizationEvent[] {
  const today = new Date();
  const formatDate = (offsetDays: number) => {
    const date = new Date(today);
    date.setDate(date.getDate() + offsetDays);
    return date.toISOString().slice(0, 10);
  };

  return [
    {
      id: "preview-event-1",
      organizationId,
      title: "Spring festival",
      date: formatDate(5),
      time: "10:00",
      endTime: "14:00",
      isAllDay: false,
      type: "community",
      colorKey: "emerald",
      location: "School meadow",
      sortOrder: 0,
    },
    {
      id: "preview-event-2",
      organizationId,
      title: "Parent coffee morning",
      date: formatDate(12),
      time: "08:30",
      isAllDay: false,
      type: "community",
      colorKey: "olive",
      location: "Community hall",
      sortOrder: 1,
    },
  ];
}

function previewDueDate(offsetDays: number): string {
  const date = new Date();
  date.setDate(date.getDate() + offsetDays);
  return date.toISOString().slice(0, 10);
}

export function getProgramParentPortalPreviewBillingPageMeta(): ParentBillingPageMeta {
  return {
    balanceDueCents: 125000,
    totalRemainingCents: 450000,
    nextDueDate: previewDueDate(14),
    nextDueAmountCents: 125000,
    openChargeCount: 2,
    paymentCount: 0,
    hasBillingSplit: false,
  };
}

export function getProgramParentPortalPreviewBillingInitialData(
  organizationId: string,
): ParentBillingInitialData {
  const now = new Date().toISOString();
  const familyId = PROGRAM_PARENT_PORTAL_PREVIEW_FAMILY_ID;
  const dueDate = previewDueDate(14);

  const charges: ParentBillingInitialData["charges"] = [
    {
      id: "preview-charge-1",
      organizationId,
      assignmentId: "preview-assignment-1",
      familyId,
      guardianId: PROGRAM_PARENT_PORTAL_PREVIEW_GUARDIAN_ID,
      label: "Tuition installment 2",
      baseAmountCents: 125000,
      amountCents: 125000,
      paidCents: 0,
      currency: "usd",
      dueDate,
      status: "sent",
      chargeType: "tuition",
      installmentNumber: 2,
      metadata: { guardianId: PROGRAM_PARENT_PORTAL_PREVIEW_GUARDIAN_ID },
      sentAt: now,
      paidAt: null,
      createdAt: now,
      updatedAt: now,
    },
    {
      id: "preview-charge-2",
      organizationId,
      assignmentId: "preview-assignment-2",
      familyId,
      guardianId: PROGRAM_PARENT_PORTAL_PREVIEW_GUARDIAN_ID,
      label: "Activity fee",
      baseAmountCents: 7500,
      amountCents: 7500,
      paidCents: 0,
      currency: "usd",
      dueDate: previewDueDate(30),
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

  const meta = getProgramParentPortalPreviewBillingPageMeta();

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
        label: "Tuition installment 2",
      },
      childrenNames: ["Jordan Morgan", "Sam Morgan"],
    },
    familySummary: {
      balanceDueCents: meta.balanceDueCents,
      totalRemainingCents: meta.totalRemainingCents,
      familyTotalRemainingCents: meta.totalRemainingCents,
      annualTuitionCents: 900000,
      hasPendingSchedule: false,
      nextCharge: {
        label: "Tuition installment 2",
        dueDate,
        amountCents: 125000,
      },
      children: [
        {
          childKey: "preview-student-1",
          studentName: "Jordan Morgan",
          assignmentId: "preview-assignment-1",
          annualTuitionCents: 450000,
          balanceDueCents: 125000,
          totalRemainingCents: 225000,
          nextCharge: {
            label: "Tuition installment 2",
            dueDate,
            amountCents: 125000,
          },
          nextChargeId: "preview-charge-1",
          status: "ready",
          selectionItem: null,
          paymentPlanLabel: "10-month plan",
        },
        {
          childKey: "preview-student-2",
          studentName: "Sam Morgan",
          assignmentId: "preview-assignment-2",
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
    guardianId: PROGRAM_PARENT_PORTAL_PREVIEW_GUARDIAN_ID,
    hasBillingSplit: false,
    initialChildKey: "preview-student-1",
    showTaxCreditPaymentBanner: false,
  };
}

function buildPreviewChildProfile(input: {
  applicationId: string;
  studentId: string;
  studentName: string;
  grade: string;
  formTitle: string;
}): ChildProfileData {
  return {
    application: {
      id: input.applicationId,
      status: "enrolled",
      submittedAt: previewDueDate(-120),
      formTitle: input.formTitle,
      schema: emptyApplicationFormSchema(),
      feeConfig: defaultApplicationFormFeeConfig(),
      stepIndex: 0,
      responses: {
        student_first_name: input.studentName.split(" ")[0] ?? input.studentName,
        student_last_name: input.studentName.split(" ").slice(1).join(" ") || "Morgan",
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
        id: "preview-teacher-1",
        name: "Ms. Rivera",
        roleTitle: "Lead teacher",
        profilePhotoUrl: null,
      },
    ],
  };
}

export function getProgramParentPortalPreviewChildProfiles(): Record<
  string,
  ChildProfileData
> {
  return {
    "preview-app-1": buildPreviewChildProfile({
      applicationId: "preview-app-1",
      studentId: "preview-student-1",
      studentName: "Jordan Morgan",
      grade: "Kindergarten",
      formTitle: "Kindergarten application",
    }),
    "preview-app-2": buildPreviewChildProfile({
      applicationId: "preview-app-2",
      studentId: "preview-student-2",
      studentName: "Sam Morgan",
      grade: "3rd grade",
      formTitle: "Elementary application",
    }),
  };
}

export function getProgramParentPortalPreviewCommitteesInitialData(): ParentCommitteesInitialData {
  return {
    browseCommittees: [
      {
        id: "preview-committee-1",
        name: "Garden committee",
        description: "Help maintain the school garden and seasonal planting days.",
        termLabel: "2025–26",
        type: "annual_volunteer",
        dutyRoles: [
          {
            id: "preview-duty-1",
            title: "Garden lead",
            description: "Coordinate weekly watering and harvest days.",
          },
        ],
        requestStatus: null,
        requestId: null,
        isMember: false,
      },
      {
        id: "preview-committee-2",
        name: "Hospitality team",
        description: "Welcome new families and support community events.",
        termLabel: "2025–26",
        type: "long_term_role",
        dutyRoles: [],
        requestStatus: null,
        requestId: null,
        isMember: false,
      },
    ],
    myCommittees: [],
    workspacesByCommitteeId: {},
  };
}

export function getProgramParentPortalPreviewMessageThreads(): MessageThreadSummary[] {
  return [
    {
      id: "preview-thread-1",
      subject: "Welcome to the program",
      title: "Admissions office",
      subtitle: "Jordan Morgan",
      color: "#487354",
      lastMessagePreview: "We are excited to have your family join us this year.",
      lastMessageAt: new Date().toISOString(),
      lastMessageTimeLabel: "Today",
      unreadCount: 1,
      participants: [],
    },
    {
      id: "preview-thread-2",
      subject: "Field trip reminder",
      title: "Class teacher",
      subtitle: "Jordan Morgan",
      color: "#6366f1",
      lastMessagePreview: "Please pack a lunch and water bottle for Friday.",
      lastMessageAt: new Date(Date.now() - 86400000).toISOString(),
      lastMessageTimeLabel: "Yesterday",
      unreadCount: 0,
      participants: [],
    },
  ];
}
