import { createMobileAppWalkthroughStep, type DemoWalkthroughStep } from "./shared";

export const rootedMeadowsWalkthroughPlaceholder: DemoWalkthroughStep[] = [
  {
    id: "discover",
    title: "Parents discover Rooted Meadows",
    description:
      "Families find you online and explore your Waldorf-guided K–8 programs.",
    icon: "globe",
    scrollTarget: "top",
  },
  {
    id: "schedule-visit",
    title: "Parents begin the conversation",
    description: "Parents submit the inquiry form to connect and schedule a visit.",
    icon: "calendarDays",
    scrollTarget: "form",
  },
  {
    id: "view-lead",
    title: "View the lead in your admin",
    description: "The inquiry appears in your admin dashboard so you can follow up.",
    preview: "admin",
    initialAdmissionsTab: "submissions",
    animateNewSubmission: true,
    icon: "layoutDashboard",
  },
  {
    id: "send-application-link",
    title: "Send enrollment link",
    description: "After the visit, you can send the enrollment link to the family.",
    preview: "admin",
    icon: "link",
    initialSelectedLeadId: "l0",
    autoSendEnrollmentLink: true,
  },
  {
    id: "parent-enrollment",
    title: "Parents go through enrollment",
    description: "Families complete the enrollment checklist from their parent portal.",
    preview: "parent",
    initialParentTab: "enrollment",
    icon: "clipboardCheck",
  },
  {
    id: "parent-pays-tuition",
    title: "Parent pays tuition",
    description: "Families pay tuition on a 10-payment plan from the parent portal.",
    preview: "parent",
    initialParentTab: "billing",
    icon: "creditCard",
  },
  {
    id: "teacher-attendance",
    title: "Teachers take attendance",
    description: "Waldorf guides track Mon–Thu attendance from the teacher portal.",
    preview: "teacher",
    initialTeacherTab: "attendance",
    icon: "clipboardList",
  },
  createMobileAppWalkthroughStep(),
  {
    id: "get-in-touch",
    title: "Got any questions or comments?",
    description:
      "Share questions or notes — we'll use your input as we build this out.",
    talkingPoint:
      "Tell us what stood out, what you'd change, or anything you'd like to see next for Rooted Meadows Waldorf School.",
    preview: "contact",
    contactPanelVariant: "feedback",
    icon: "messageCircle",
  },
];

const rootedMeadowsApplicationStep: DemoWalkthroughStep = {
  id: "submit-application",
  title: "Family submits the application",
  description:
    "Parents click Apply Now on the school's website and complete the MudKitchen-hosted application.",
  preview: "application",
  previewHint:
    "Application questions are fully customizable — you'll be able to add, remove, and edit fields once your admin portal is set up. This is just a prototype preview.",
  previewHintDelayMs: 800,
  icon: "clipboardCheck",
};

const rootedMeadowsObservationStep: DemoWalkthroughStep = {
  id: "book-observation",
  title: "Parent books observation visit",
  description:
    "After submitting the application, families schedule their child's observation visit.",
  preview: "observation",
  previewHint:
    "You can set your own availability — families only see days and times you've opened for booking.",
  previewHintDelayMs: 800,
  icon: "calendarDays",
};

const rootedMeadowsAssignTuitionStep: DemoWalkthroughStep = {
  id: "assign-family-tuition",
  title: "Set a custom tuition rate",
  description:
    "Override standard program pricing for a family — sibling discounts, financial aid, or custom monthly amounts.",
  preview: "admin",
  initialAdminPage: "myschool",
  initialMySchoolTab: "tuition",
  initialSelectedTuitionFamilyId: "fb1",
  openInitialTuitionAdjustModal: true,
  openInitialTuitionAdjustModalDelayMs: 700,
  icon: "badgePercent",
};

const rootedMeadowsSendContractStep: DemoWalkthroughStep = {
  id: "send-enrollment-contract",
  title: "Send the enrollment contract",
  description:
    "After the observation visit is complete, you send the family their enrollment contract.",
  preview: "admin",
  icon: "link",
  initialSelectedLeadId: "l0",
  initialSelectedLeadStatus: "needs_contract",
  initialSelectedLeadApplicationSectionIndex: 3,
  openInitialLeadDetail: false,
  hideLeadDetailEnrollmentAction: true,
  highlightSendEnrollmentLeadId: "l0",
};

const rootedMeadowsCreateCommitteeStep: DemoWalkthroughStep = {
  id: "create-committee",
  title: "Create a committee workspace",
  description:
    "Set up Service & Sunshine from a template — preload the handbook, calendar, and starter tasks before inviting families.",
  preview: "admin",
  initialAdminPage: "committees",
  openCreateCommitteeModal: true,
  openCreateCommitteeModalDelayMs: 600,
  highlightCreateWorkspace: true,
  icon: "users",
};

const rootedMeadowsAugustSignupStep: DemoWalkthroughStep = {
  id: "august-volunteer-signup",
  title: "Send August signup to families",
  description:
    "Email the volunteer preference form to all enrolled families before placing members into committees.",
  preview: "admin",
  initialAdminPage: "committees",
  initialCommitteeAdminView: "list",
  openSendAugustSignupModal: true,
  openSendAugustSignupModalDelayMs: 600,
  icon: "messageCircle",
};

const rootedMeadowsResourceAccessStep: DemoWalkthroughStep = {
  id: "committee-resource-access",
  title: "Restrict resources by member role",
  description:
    "Limit sensitive planning docs to committee leads or faculty liaisons — general guides stay visible to all members.",
  preview: "admin",
  initialAdminPage: "committees",
  initialCommitteeId: "service-sunshine-2025",
  initialCommitteeAdminView: "detail",
  initialCommitteeSection: "resources",
  icon: "users",
};

const rootedMeadowsAssignTasksStep: DemoWalkthroughStep = {
  id: "assign-committee-tasks",
  title: "Assign committee tasks",
  description:
    "Drag tasks across the board or assign volunteers from the kanban — open tasks get claimed, assigned work moves to In Progress.",
  preview: "admin",
  initialAdminPage: "committees",
  initialCommitteeId: "service-sunshine-2025",
  initialCommitteeAdminView: "detail",
  initialCommitteeSection: "tasks",
  icon: "clipboardList",
};

const rootedMeadowsParentCommitteeStep: DemoWalkthroughStep = {
  id: "parent-committee-workspace",
  title: "Parent joins the committee workspace",
  description:
    "Sarah opens Service & Sunshine — a private workspace with resources, calendar, tasks, and committee-only messaging.",
  preview: "parent",
  initialParentTab: "committees",
  initialCommitteeId: "service-sunshine-2025",
  initialCommitteeSection: "home",
  icon: "heart",
};

const rootedMeadowsArchiveCommitteeStep: DemoWalkthroughStep = {
  id: "archive-committee",
  title: "Archive and roll over for next year",
  description:
    "At year end, archive the committee, bulk-uninvite members, and duplicate the workspace template for the next school year.",
  preview: "admin",
  initialAdminPage: "committees",
  initialCommitteeId: "service-sunshine-2025",
  initialCommitteeAdminView: "detail",
  openArchiveCommitteeModal: true,
  icon: "users",
};

const rootedMeadowsTeacherMessagesStep: DemoWalkthroughStep = {
  id: "teacher-message-parents",
  title: "Teachers message parents",
  description:
    "Guides reach families directly from the teacher portal — one-on-one threads for check-ins, conferences, and day-of updates.",
  preview: "teacher",
  initialTeacherTab: "messages",
  icon: "messageCircle",
};

const rootedMeadowsTeacherStudentsStep: DemoWalkthroughStep = {
  id: "teacher-view-students",
  title: "Teachers view student details",
  description:
    "Guides open My Students to see their roster — grade, room, and live check-in status across programs.",
  preview: "teacher",
  initialTeacherTab: "students",
  initialSelectedTeacherStudentId: "s1",
  openInitialTeacherStudentDetailDelayMs: 600,
  icon: "users",
};

export const rootedMeadowsPrototypeWalkthroughPlaceholder: DemoWalkthroughStep[] = [
  rootedMeadowsApplicationStep,
  rootedMeadowsObservationStep,
  rootedMeadowsSendContractStep,
  ...rootedMeadowsWalkthroughPlaceholder
    .filter(
      (step) =>
        step.preview !== undefined &&
        step.id !== "view-lead" &&
        step.id !== "send-application-link" &&
        step.id !== "teacher-attendance" &&
        step.id !== "mobile-app",
    )
    .flatMap((step) => {
      const mapped =
        step.id === "parent-enrollment"
          ? {
              ...step,
              description:
                "Families sign the Standard Enrollment Agreement and complete the enrollment checklist — including activities and supply fees.",
              parentEnrollmentVariant: "prototype" as const,
            }
          : step.id === "parent-pays-tuition"
            ? {
                ...step,
                billingChildIds: ["emma", "jake"] as const,
              }
            : step;
      if (step.id === "parent-enrollment") {
        return [mapped, rootedMeadowsAssignTuitionStep];
      }
      if (step.id === "parent-pays-tuition") {
        return [
          mapped,
          rootedMeadowsCreateCommitteeStep,
          rootedMeadowsResourceAccessStep,
          rootedMeadowsAugustSignupStep,
          rootedMeadowsAssignTasksStep,
          rootedMeadowsParentCommitteeStep,
          rootedMeadowsArchiveCommitteeStep,
        ];
      }
      if (step.id === "get-in-touch") {
        const teacherAttendance = rootedMeadowsWalkthroughPlaceholder.find(
          (s) => s.id === "teacher-attendance",
        )!;
        return [
          teacherAttendance,
          rootedMeadowsTeacherStudentsStep,
          rootedMeadowsTeacherMessagesStep,
          createMobileAppWalkthroughStep(),
          mapped,
        ];
      }
      return [mapped];
    }),
];
