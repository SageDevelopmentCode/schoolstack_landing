import type { SubmissionDetailPreview } from "@/components/school-admin/admissions/SubmissionDetailPreviewContext";
import type { DemoSubmissionLead } from "@/components/demo/shared/demo-submissions-mapper";
import { mapDemoLeadToSubmission } from "@/components/demo/shared/demo-submissions-mapper";
import type { AdminPostSubmitStep } from "@/lib/admissions/admin-post-submit-steps";
import {
  defaultApplicationFormFeeConfig,
  type ApplicationField,
  type ApplicationFormSchema,
} from "@/lib/admissions/application-form-schema";
import type { FamilyAdmissionTimelineEvent } from "@/lib/admissions/application-submissions";
import type { FamilyGuardianRecord } from "@/lib/admissions/family-guardians";
import type { PaymentRecordDisplayRow } from "@/lib/admissions/payment-records";
import {
  DEMO_ENROLLMENT_CHECKLIST_PREVIEW_ITEMS,
  DEMO_MARKETING_CHECKLIST_TEMPLATE_ID,
  getDemoSubmissionFlow,
} from "@/data/school-demos/demo-admin-admissions-fixtures";
import { DEMO_PORTAL_ORG_ID } from "@/data/school-demos/demo-portal-shared";

/*
 * Fixture detail for the real Garden submission drawer in the marketing
 * walkthrough (`ApplicationSubmissionDetailPanel previewDetail`). Built from
 * the same demo leads as the submissions table, so the row and the drawer
 * always agree.
 */

const DEMO_CHECKLIST_NAME = "Primary Program enrollment checklist";

function fieldType(type: string): ApplicationField["type"] {
  switch (type) {
    case "phone":
      return "tel";
    case "checkbox":
    case "select":
    case "date":
    case "email":
      return type;
    default:
      return "text";
  }
}

function buildLeadSchema(lead: DemoSubmissionLead): ApplicationFormSchema {
  const flow = getDemoSubmissionFlow(lead.flowId);
  return {
    sections: (flow?.steps ?? []).map((step) => ({
      id: step.id,
      title: step.title,
      fields: step.fields.map((field) => ({
        id: field.id,
        label: field.label,
        type: fieldType(field.type),
        required: field.required,
        options: field.options?.map((option) => ({ value: option, label: option })),
      })),
    })),
    acknowledgments: [],
  };
}

function leadResponses(lead: DemoSubmissionLead): Record<string, string> {
  return Object.fromEntries(
    Object.entries(lead.responses).map(([key, value]) => [
      key,
      typeof value === "boolean" ? (value ? "true" : "false") : value,
    ]),
  );
}

function splitName(name: string): { firstName: string; lastName: string } {
  const [firstName = name, ...rest] = name.trim().split(/\s+/);
  return { firstName, lastName: rest.join(" ") };
}

/** "After follow-up": the family interview is done and documented. */
function buildPostSubmitSteps(status: string, submittedAt: string | null): AdminPostSubmitStep[] {
  if (status === "draft") return [];
  const day = (submittedAt ?? "2026-04-15T11:48:00.000Z").slice(0, 10);
  return [
    {
      actionId: "post-submit-interview",
      type: "schedule_family_interview",
      title: "Family interview",
      required: true,
      sortIndex: 0,
      status: "scheduled",
      booking: {
        visitId: "demo-visit-interview",
        schedulingMode: "time_slot",
        scheduledDate: day,
        startTimeSlot: "10:00",
        durationMinutes: 30,
        completedManuallyAt: `${day}T10:30:00.000Z`,
        adminCompletionNotes: "Lovely conversation. Great fit for the program.",
      },
    },
  ];
}

function buildHistory(
  lead: DemoSubmissionLead,
  submission: ReturnType<typeof mapDemoLeadToSubmission>,
): FamilyAdmissionTimelineEvent[] {
  const base = {
    applicationId: lead.id,
    applicationStatus: submission.status,
    studentLabel: submission.studentLabel,
    programName: submission.programName,
  };
  const events: FamilyAdmissionTimelineEvent[] = [];
  if (submission.submittedAt) {
    events.push({
      ...base,
      id: `${lead.id}-submitted`,
      kind: "submitted",
      title: `${submission.formTitle} submitted`,
      occurredAt: submission.submittedAt,
    });
  }
  events.push({
    ...base,
    id: `${lead.id}-created`,
    kind: "created",
    title: `${submission.formTitle} started`,
    occurredAt: submission.createdAt,
  });
  return events;
}

/**
 * Drawer detail for one demo lead: the application, the family's guardian,
 * history, payments, and the enrollment checklist that "Start enrollment"
 * sends (so Accept → Start enrollment runs on fixtures).
 */
export function buildDemoSubmissionDetail(lead: DemoSubmissionLead): SubmissionDetailPreview {
  const submission = mapDemoLeadToSubmission(lead);
  const submittedAt = submission.submittedAt ?? (submission.status === "draft" ? null : submission.updatedAt);
  const familyId = `demo-family-${lead.id}`;
  const guardianName = splitName(lead.name);
  const guardians: FamilyGuardianRecord[] = [
    {
      id: submission.primaryGuardianId ?? `guardian-${lead.id}`,
      firstName: guardianName.firstName,
      lastName: guardianName.lastName,
      email: lead.email,
      userId: `demo-user-${lead.id}`,
      relationship: "Parent",
      isLinked: true,
      hasEverSignedIn: true,
      lastSignInAt: submission.updatedAt,
    },
  ];

  const payments: PaymentRecordDisplayRow[] =
    submission.feeEnabled && submission.feeStatus === "paid"
      ? [
          {
            id: `demo-payment-${lead.id}`,
            organizationId: DEMO_PORTAL_ORG_ID,
            applicationId: lead.id,
            familyId,
            tuitionChargeId: null,
            paymentType: "application_fee",
            enrollmentChecklistItemId: null,
            label: "Application fee",
            payerUserId: `demo-user-${lead.id}`,
            stripeCheckoutSessionId: null,
            stripePaymentIntentId: null,
            amountCents: 7500,
            amountAppliedCents: 7500,
            chargedAmountCents: 7500,
            processingFeeCents: null,
            paymentMethodType: "card",
            currency: "usd",
            status: "succeeded",
            stripeProviderStatus: null,
            paidAt: submittedAt,
            createdAt: submittedAt ?? submission.createdAt,
            payerEmail: lead.email,
            applicantLabel: submission.studentLabel,
          },
        ]
      : [];

  const items = DEMO_ENROLLMENT_CHECKLIST_PREVIEW_ITEMS;
  const hasChecklist = submission.status === "enrolling" || submission.status === "enrolled";

  return {
    detail: {
      id: lead.id,
      status: submission.status,
      submittedAt,
      formTitle: submission.formTitle,
      schema: buildLeadSchema(lead),
      feeConfig: defaultApplicationFormFeeConfig(),
      feeStatus: submission.feeEnabled ? submission.feeStatus : "not_required",
      stepIndex: Math.max(0, submission.stepIndex),
      responses: leadResponses(lead),
      acknowledgments: {},
      postSubmitSteps: buildPostSubmitSteps(submission.status, submittedAt),
      studentId: null,
      profilePhotoUrl: null,
    },
    familyId,
    guardians,
    payments,
    history: buildHistory(lead, submission),
    hasChecklist,
    publishedChecklistName: DEMO_CHECKLIST_NAME,
    startEnrollment: {
      applicationId: lead.id,
      status: submission.status,
      templateName: DEMO_CHECKLIST_NAME,
      groups: [
        {
          groupId: "demo-agreement-group",
          groupLabel: "Enrollment agreement",
          variants: [
            {
              id: "demo-agreement-standard",
              label: "Standard Enrollment Agreement",
              isDefault: true,
              variantKey: "standard",
              sectionCount: 4,
            },
            {
              id: "demo-agreement-support",
              label: "Conditional Support Agreement",
              isDefault: false,
              variantKey: "conditional_support",
              sectionCount: 2,
            },
          ],
        },
      ],
      sharedItems: items
        .filter((item) => item.required)
        .slice(0, 4)
        .map((item) => ({ id: item.id, label: item.label, type: item.type })),
    },
    enrollmentStatus: {
      status: "in_progress",
      progress: { completed: 0, total: items.filter((item) => item.required).length },
      variantLabels: ["Standard Enrollment Agreement"],
      items,
      instances: [],
      checklistId: `${DEMO_MARKETING_CHECKLIST_TEMPLATE_ID}-${lead.id}`,
    },
  };
}
