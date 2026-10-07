import type { DemoSubmissionLead } from "@/components/demo/shared/demo-submissions-mapper";
import type { DemoSubmissionFlowStep } from "@/components/demo/shared/demo-submissions-mapper";
import {
  defaultApplicationFormFeeConfig,
  defaultApplicationFormNotificationConfig,
  defaultApplicationFormPostSubmitConfig,
  type ApplicationFormSchema,
  type ApplicationFormVersion,
} from "@/lib/admissions/application-form-schema";
import {
  createBlankChecklistItem,
  type EnrollmentChecklistItem,
} from "@/lib/admissions/enrollment-checklist-schema";
import type { EnrollmentChecklistTemplate } from "@/lib/admissions/enrollment-checklist-templates";
import type { EnrollmentFlowsListData } from "@/lib/school-admin/load-enrollment-flows-list-data";
import { buildDemoPrograms } from "@/data/school-demos/demo-admin-programs-fixtures";
import {
  DEMO_PORTAL_ORG_ID,
  resolveDemoSchoolName,
} from "@/data/school-demos/demo-portal-shared";

export const DEMO_MARKETING_APPLY_FORM_ID = "demo-admissions-apply-form";
export const DEMO_MARKETING_CHECKLIST_TEMPLATE_ID = "demo-admissions-checklist";
export const DEMO_MARKETING_CHECKLIST_POLICIES_ITEM_ID =
  "a1000001-0001-4001-8001-000000000001";
export const DEMO_MARKETING_CHECKLIST_PREVIEW_SIGNER_NAME = "Sarah Mitchell";

const DEMO_ISO = "2026-06-01T12:00:00.000Z";

export const DEMO_ADMIN_SUBMISSION_LEADS: DemoSubmissionLead[] = [
  {
    id: "l0",
    name: "Jennifer Walsh",
    email: "jwalsh@email.com",
    phone: "(512) 555-0198",
    childName: "Ethan Walsh",
    childAge: null,
    status: "new",
    tags: ["Schedule a Tour", "2026–27 Enrollment"],
    date: "12 minutes ago",
    message:
      "Virtual Academy — bright ADHD learner interested in theatre-integrated academics and a place to belong.",
    flowId: "flow-5",
    responses: {
      f29: "Jennifer Walsh",
      f30: "jwalsh@email.com",
      f31: "Virtual Academy",
      f32: "Ethan Walsh",
      f33: "8th Grade",
    },
  },
  {
    id: "l1",
    name: "Diana Foster",
    email: "diana@email.com",
    phone: "(512) 555-0142",
    childName: "Noah Foster",
    childAge: 5,
    status: "new",
    tags: ["Summer 2026"],
    date: "18 minutes ago",
    message: null,
    flowId: "flow-3",
    responses: {
      f16: "Diana Foster",
      f17: "diana@email.com",
      f18: "Noah Foster",
      f19: false,
    },
  },
  {
    id: "l2",
    name: "Robert Kim",
    email: "rkim@gmail.com",
    phone: "(737) 555-0218",
    childName: null,
    childAge: null,
    status: "contacted",
    tags: ["School Year", "Financial Aid"],
    date: "5 hours ago",
    message: "Interested in fall enrollment for my daughter in 3rd grade.",
    flowId: "flow-1",
    responses: {
      f1: "Robert",
      f2: "Kim",
      f3: "rkim@gmail.com",
      f4: "(737) 555-0218",
      f5: "Hannah Kim",
      f6: "2017-01-22",
      f7: "3rd",
      f8: "Full Day",
      f9: "2026-08-18",
      f10: true,
    },
  },
  {
    id: "l3",
    name: "Priya Patel",
    email: "ppatel@email.com",
    phone: "(512) 555-0391",
    childName: "Raj Patel",
    childAge: 7,
    status: "emailed",
    tags: ["School Year"],
    date: "Mar 20",
    message: null,
    flowId: "flow-1",
    responses: {
      f1: "Priya",
      f2: "Patel",
      f3: "ppatel@email.com",
      f4: "(512) 555-0391",
      f5: "Raj Patel",
      f6: "2018-06-04",
      f7: "2nd",
      f8: "Half Day",
      f9: "2026-08-24",
      f10: false,
    },
  },
  {
    id: "l4",
    name: "Mark Sullivan",
    email: "msullivan@email.com",
    phone: "(737) 555-0477",
    childName: null,
    childAge: null,
    status: "new",
    tags: ["Summer 2026"],
    date: "3 hours ago",
    message: "Looking for summer options for twin boys, ages 7.",
    flowId: "flow-3",
    responses: {
      f16: "Mark Sullivan",
      f17: "msullivan@email.com",
      f18: "Alex & Ben Sullivan (twins)",
      f19: false,
    },
  },
  {
    id: "l5",
    name: "Claire Beaumont",
    email: "claire.b@email.com",
    phone: "(512) 555-0563",
    childName: "Lily Beaumont",
    childAge: 6,
    status: "application_sent",
    tags: ["School Year"],
    date: "Mar 15",
    message: null,
    flowId: "flow-1",
    responses: {
      f1: "Claire",
      f2: "Beaumont",
      f3: "claire.b@email.com",
      f4: "(512) 555-0563",
      f5: "Lily Beaumont",
      f6: "2019-11-30",
      f7: "1st",
      f8: "Full Day",
      f9: "2026-08-10",
      f10: false,
    },
  },
  {
    id: "l6",
    name: "Jerome Watkins",
    email: "jwatkins@email.com",
    phone: "(737) 555-0649",
    childName: "Tyler Watkins",
    childAge: 9,
    status: "enrolled",
    tags: ["Both"],
    date: "Feb 10",
    message: null,
    flowId: "flow-1",
    responses: {
      f1: "Jerome",
      f2: "Watkins",
      f3: "jwatkins@email.com",
      f4: "(737) 555-0649",
      f5: "Tyler Watkins",
      f6: "2016-04-18",
      f7: "4th",
      f8: "After Care",
      f9: "2026-05-26",
      f10: false,
    },
  },
  {
    id: "l7",
    name: "Sandra Cho",
    email: "sandcho@email.com",
    phone: "(512) 555-0735",
    childName: null,
    childAge: null,
    status: "new",
    tags: [],
    date: "2 hours ago",
    message: "Heard about your school from a friend. What are your rates?",
    flowId: "flow-3",
    responses: {
      f16: "Sandra Cho",
      f17: "sandcho@email.com",
      f18: "Jordan Cho",
      f19: false,
    },
  },
  {
    id: "l8",
    name: "Luis Mendez",
    email: "lmendez@email.com",
    phone: "(737) 555-0821",
    childName: "Sofia Mendez",
    childAge: 8,
    status: "contacted",
    tags: ["School Year"],
    date: "4 days ago",
    message: null,
    flowId: "flow-1",
    responses: {
      f1: "Luis",
      f2: "Mendez",
      f3: "lmendez@email.com",
      f4: "(737) 555-0821",
      f5: "Sofia Mendez",
      f6: "2017-09-02",
      f7: "3rd",
      f8: "Full Day",
      f9: "2026-08-17",
      f10: true,
    },
  },
];

const FLOW_1_STEPS: DemoSubmissionFlowStep[] = [
  {
    id: "s1",
    title: "Parent Info",
    fields: [
      { id: "f1", label: "First Name", type: "text", required: true },
      { id: "f2", label: "Last Name", type: "text", required: true },
      { id: "f3", label: "Email", type: "email", required: true },
      { id: "f4", label: "Phone", type: "phone", required: false },
    ],
  },
  {
    id: "s2",
    title: "Child Details",
    fields: [
      { id: "f5", label: "Child's Name", type: "text", required: true },
      { id: "f6", label: "Date of Birth", type: "date", required: true },
      {
        id: "f7",
        label: "Grade Level",
        type: "select",
        required: true,
        options: ["Pre-K", "K", "1st", "2nd", "3rd"],
      },
    ],
  },
  {
    id: "s3",
    title: "Program Selection",
    fields: [
      {
        id: "f8",
        label: "Preferred Program",
        type: "select",
        required: true,
        options: ["Full Day", "Half Day", "After Care"],
      },
      { id: "f9", label: "Preferred Start Date", type: "date", required: false },
      { id: "f10", label: "Financial Aid Needed", type: "checkbox", required: false },
    ],
  },
];

const DEMO_SUBMISSION_FLOWS: Record<
  string,
  { id: string; name: string; steps: DemoSubmissionFlowStep[] }
> = {
  "flow-1": { id: "flow-1", name: "Apply Now Form", steps: FLOW_1_STEPS },
  "flow-3": {
    id: "flow-3",
    name: "Waitlist Signup",
    steps: [
      {
        id: "ws1",
        title: "Contact",
        fields: [
          { id: "f16", label: "Parent name", type: "text", required: true },
          { id: "f17", label: "Email", type: "email", required: true },
          { id: "f18", label: "Child name", type: "text", required: true },
          { id: "f19", label: "Summer program", type: "checkbox", required: false },
        ],
      },
    ],
  },
  "flow-5": {
    id: "flow-5",
    name: "Schedule a Tour",
    steps: [
      {
        id: "tour1",
        title: "Tour request",
        fields: [
          { id: "f29", label: "Parent name", type: "text", required: true },
          { id: "f30", label: "Email", type: "email", required: true },
          { id: "f31", label: "Program", type: "text", required: true },
          { id: "f32", label: "Student name", type: "text", required: true },
          { id: "f33", label: "Grade", type: "text", required: false },
        ],
      },
    ],
  },
};

export function getDemoSubmissionFlow(flowId: string) {
  return DEMO_SUBMISSION_FLOWS[flowId] ?? null;
}

function buildDemoApplyFormSchema(): ApplicationFormSchema {
  return {
    sections: FLOW_1_STEPS.map((step) => ({
      id: step.id,
      title: step.title,
      fields: step.fields.map((field) => ({
        id: field.id,
        label: field.label,
        type:
          field.type === "phone"
            ? "tel"
            : field.type === "checkbox"
              ? "checkbox"
              : field.type === "select"
                ? "select"
                : field.type === "date"
                  ? "date"
                  : field.type === "email"
                    ? "email"
                    : "text",
        required: field.required,
        options: field.options?.map((option) => ({ value: option, label: option })),
      })),
    })),
    acknowledgments: [],
  };
}

function buildDemoApplyForm(): ApplicationFormVersion {
  return {
    id: DEMO_MARKETING_APPLY_FORM_ID,
    organization_id: DEMO_PORTAL_ORG_ID,
    program_id: "program-primary",
    form_kind: "apply",
    version: 1,
    status: "published",
    title: "Apply Now Form",
    intro: "Tell us about your family and the program you are interested in.",
    public_slug: "apply",
    schema: buildDemoApplyFormSchema(),
    fee_config: defaultApplicationFormFeeConfig(),
    post_submit_config: {
      ...defaultApplicationFormPostSubmitConfig(),
      actions: [
        {
          id: "post-submit-interview",
          type: "schedule_family_interview",
          enabled: true,
          title: "Schedule a family interview",
        },
      ],
    },
    notification_config: defaultApplicationFormNotificationConfig(),
    published_at: DEMO_ISO,
    created_at: DEMO_ISO,
    updated_at: DEMO_ISO,
  };
}

function buildDemoChecklistTemplate(): EnrollmentChecklistTemplate {
  return {
    id: DEMO_MARKETING_CHECKLIST_TEMPLATE_ID,
    organizationId: DEMO_PORTAL_ORG_ID,
    programId: "program-primary",
    name: "Primary Program enrollment checklist",
    enrollmentPath: "enrollment",
    status: "published",
    createdAt: DEMO_ISO,
    updatedAt: DEMO_ISO,
  };
}

function buildProgramPoliciesDocument(schoolName: string) {
  return {
    kind: "inline_sections" as const,
    sections: [
      {
        id: "demo-section-program-policies",
        title: "Program overview & key policies",
        body: `${schoolName} provides a creative, arts-integrated program for elementary students. Families agree to regular attendance, respectful communication with staff and students, and partnership with teachers on each child's growth.

Tuition, billing, and withdrawal policies are described in the family handbook. You are responsible for reviewing those policies before enrollment is complete.

By signing below, you confirm that you have read this overview and understand how enrollment works for your child at ${schoolName}.`,
      },
    ],
  };
}

function buildChecklistPreviewItems(): EnrollmentChecklistItem[] {
  const schoolName = resolveDemoSchoolName();
  const policies = createBlankChecklistItem("document_sign", "Program Description & Key Policies");
  policies.id = DEMO_MARKETING_CHECKLIST_POLICIES_ITEM_ID;
  policies.document = buildProgramPoliciesDocument(schoolName);
  const agreement = createBlankChecklistItem("document_sign", "Community Agreement");
  const health = createBlankChecklistItem("form", "Emergency Contact & Health Form");
  const immunizations = createBlankChecklistItem("file_upload", "Proof of Immunizations");
  const fee = createBlankChecklistItem("payment", "Pay Registration Fee");
  fee.payment = {
    label: "Registration fee",
    amountCents: 15000,
  };
  const acknowledgment = createBlankChecklistItem(
    "acknowledgment",
    "Photo release acknowledgment",
  );
  acknowledgment.required = false;

  return [policies, agreement, health, immunizations, fee, acknowledgment];
}

export const DEMO_ENROLLMENT_CHECKLIST_PREVIEW_ITEMS = buildChecklistPreviewItems();

export function buildDemoPreviewChecklistItemsByTemplateId(): Record<
  string,
  EnrollmentChecklistItem[]
> {
  return {
    [DEMO_MARKETING_CHECKLIST_TEMPLATE_ID]: DEMO_ENROLLMENT_CHECKLIST_PREVIEW_ITEMS,
  };
}

export function buildDemoEnrollmentFlowsListData(): EnrollmentFlowsListData {
  const programs = buildDemoPrograms().map((program) => ({
    id: program.id,
    name: program.name,
  }));

  return {
    forms: [buildDemoApplyForm()],
    checklists: [buildDemoChecklistTemplate()],
    programs,
    stripePaymentsReady: true,
  };
}
