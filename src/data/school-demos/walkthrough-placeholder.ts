export type DemoWalkthroughIcon =
  | "globe"
  | "calendarDays"
  | "layoutDashboard"
  | "gitBranch"
  | "link"
  | "clipboardCheck"
  | "creditCard"
  | "clipboardList"
  | "messageCircle"
  | "badgePercent"
  | "users"
  | "heart"
  | "smartphone";

export type DemoWalkthroughAdminPage = "myschool" | "committees";

export type DemoWalkthroughCommitteeAdminView =
  | "list"
  | "detail"
  | "signup"
  | "archive";

export type DemoWalkthroughCommitteeSection =
  | "home"
  | "about"
  | "resources"
  | "calendar"
  | "tasks"
  | "messages"
  | "members"
  | "settings";

export type DemoWalkthroughMySchoolTab =
  | "students"
  | "programs"
  | "staff"
  | "classrooms"
  | "tuition";

export type DemoWalkthroughAdmissionsTab = "flows" | "submissions";

export type DemoWalkthroughParentTab = "enrollment" | "home" | "billing" | "committees";

export type DemoWalkthroughTeacherTab =
  | "dashboard"
  | "students"
  | "hours"
  | "messages"
  | "calendar"
  | "feed"
  | "attendance"
  | "payroll"
  | "forms";

export type DemoWalkthroughPreview =
  | "website"
  | "application"
  | "observation"
  | "admin"
  | "parent"
  | "teacher"
  | "contact"
  | "mobile";

export interface DemoWalkthroughStep {
  id: string;
  title: string;
  description: string;
  talkingPoint?: string;
  previewHint?: string;
  previewHintDelayMs?: number;
  preview?: DemoWalkthroughPreview;
  scrollTarget?: "top" | "form";
  initialAdmissionsTab?: DemoWalkthroughAdmissionsTab;
  initialSelectedLeadId?: string;
  initialSelectedLeadStatus?: string;
  initialSelectedLeadApplicationSectionIndex?: number;
  initialSelectedFlowId?: string;
  initialParentTab?: DemoWalkthroughParentTab;
  initialTeacherTab?: DemoWalkthroughTeacherTab;
  initialSelectedTeacherStudentId?: string;
  openInitialTeacherStudentDetailDelayMs?: number;
  animateNewSubmission?: boolean;
  autoSendEnrollmentLink?: boolean;
  autoSendEnrollmentLinkDelayMs?: number;
  openInitialLeadDetail?: boolean;
  hideLeadDetailEnrollmentAction?: boolean;
  highlightSendEnrollmentLeadId?: string;
  parentEnrollmentVariant?: "prototype";
  initialAdminPage?: DemoWalkthroughAdminPage;
  initialMySchoolTab?: DemoWalkthroughMySchoolTab;
  initialSelectedTuitionFamilyId?: string;
  openInitialTuitionAdjustModal?: boolean;
  openInitialTuitionAdjustModalDelayMs?: number;
  billingChildIds?: readonly ("emma" | "jake" | "liam")[];
  initialCommitteeId?: string;
  initialCommitteeSection?: DemoWalkthroughCommitteeSection;
  initialCommitteeAdminView?: DemoWalkthroughCommitteeAdminView;
  openCreateCommitteeModal?: boolean;
  openCreateCommitteeModalDelayMs?: number;
  highlightCreateWorkspace?: boolean;
  openSendAugustSignupModal?: boolean;
  openSendAugustSignupModalDelayMs?: number;
  openArchiveCommitteeModal?: boolean;
  contactPanelVariant?: "schedule" | "feedback";
  icon: DemoWalkthroughIcon;
}

export const athenaWalkthroughPlaceholder: DemoWalkthroughStep[] = [
  {
    id: "discover",
    title: "Parents discover your school",
    description: "Families find you online and explore your programs.",
    icon: "globe",
    scrollTarget: "top",
  },
  {
    id: "discovery-call",
    title: "Parents schedule a discovery call",
    description: "Parents submit the inquiry form to book a call.",
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
    title: "Start enrollment",
    description:
      "After the discovery call, accept the application and send the family their enrollment checklist.",
    preview: "admin",
    icon: "link",
    initialSelectedLeadId: "l0",
    autoSendEnrollmentLink: true,
  },
  {
    id: "parent-enrollment",
    title: "Parents go through the enrollment",
    description: "Families complete the enrollment checklist from their parent portal.",
    preview: "parent",
    initialParentTab: "enrollment",
    icon: "clipboardCheck",
  },
  {
    id: "parent-pays-tuition",
    title: "Parent pays tuition",
    description:
      "Families pay tuition and manage invoices from the parent portal.",
    preview: "parent",
    initialParentTab: "billing",
    icon: "creditCard",
  },
  {
    id: "teacher-attendance",
    title: "Teachers take attendance",
    description: "Staff track daily attendance from the teacher portal.",
    preview: "teacher",
    initialTeacherTab: "attendance",
    icon: "clipboardList",
  },
  {
    id: "get-in-touch",
    title: "Ready for next steps?",
    description: "Schedule a meeting, or email or call us to talk through this concept.",
    talkingPoint:
      "Pick a time on the calendar, or reach out directly — we'd love to walk through how this could work for your school.",
    preview: "contact",
    icon: "calendarDays",
  },
];

export const wonderhereWalkthroughPlaceholder: DemoWalkthroughStep[] = [
  {
    id: "discover",
    title: "Parents discover your school",
    description: "Families find you online and explore your Lakeland programs.",
    icon: "globe",
    scrollTarget: "top",
  },
  {
    id: "schedule-visit",
    title: "Parents schedule a visit",
    description: "Parents submit the inquiry form to request info or book a visit.",
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
    title: "Start enrollment",
    description:
      "After the visit, accept the application and send the family their enrollment checklist.",
    preview: "admin",
    icon: "link",
    initialSelectedLeadId: "l0",
    autoSendEnrollmentLink: true,
  },
  {
    id: "parent-enrollment",
    title: "Parents go through the enrollment",
    description: "Families complete the enrollment checklist from their parent portal.",
    preview: "parent",
    initialParentTab: "enrollment",
    icon: "clipboardCheck",
  },
  {
    id: "parent-pays-tuition",
    title: "Parent pays tuition",
    description:
      "Families pay tuition and manage invoices from the parent portal.",
    preview: "parent",
    initialParentTab: "billing",
    icon: "creditCard",
  },
  {
    id: "teacher-attendance",
    title: "Teachers take attendance",
    description: "Staff track daily attendance from the teacher portal.",
    preview: "teacher",
    initialTeacherTab: "attendance",
    icon: "clipboardList",
  },
  {
    id: "get-in-touch",
    title: "Ready for next steps?",
    description: "Schedule a meeting, or email or call us to talk through this concept.",
    talkingPoint:
      "Pick a time on the calendar, or reach out directly — we'd love to walk through how this could work for your school.",
    preview: "contact",
    icon: "calendarDays",
  },
];

export const wonderingOaksWalkthroughPlaceholder: DemoWalkthroughStep[] = [
  {
    id: "discover",
    title: "Parents discover your school",
    description: "Families find you online and explore your Conroe microschool programs.",
    icon: "globe",
    scrollTarget: "top",
  },
  {
    id: "schedule-visit",
    title: "Parents schedule a visit",
    description: "Parents submit the inquiry form to request a campus visit.",
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
    title: "Start enrollment",
    description:
      "After the visit, accept the application and send the family their enrollment checklist.",
    preview: "admin",
    icon: "link",
    initialSelectedLeadId: "l0",
    autoSendEnrollmentLink: true,
  },
  {
    id: "parent-enrollment",
    title: "Parents go through the enrollment",
    description: "Families complete the enrollment checklist from their parent portal.",
    preview: "parent",
    initialParentTab: "enrollment",
    icon: "clipboardCheck",
  },
  {
    id: "parent-pays-tuition",
    title: "Parent pays tuition",
    description:
      "Families pay tuition and manage invoices from the parent portal.",
    preview: "parent",
    initialParentTab: "billing",
    icon: "creditCard",
  },
  {
    id: "teacher-attendance",
    title: "Teachers take attendance",
    description: "Staff track daily attendance from the teacher portal.",
    preview: "teacher",
    initialTeacherTab: "attendance",
    icon: "clipboardList",
  },
  {
    id: "get-in-touch",
    title: "Ready for next steps?",
    description: "Schedule a meeting, or email or call us to talk through this concept.",
    talkingPoint:
      "Pick a time on the calendar, or reach out directly — we'd love to walk through how this could work for your school.",
    preview: "contact",
    icon: "calendarDays",
  },
];

export const wildHeartsWalkthroughPlaceholder: DemoWalkthroughStep[] = [
  {
    id: "discover",
    title: "Parents discover your school",
    description: "Families find Wild Hearts online and explore programs in Visalia.",
    icon: "globe",
    scrollTarget: "top",
  },
  {
    id: "apply-now",
    title: "Parents submit an application",
    description: "Parents fill out the inquiry form to apply for Wild Hearts or True North.",
    icon: "calendarDays",
    scrollTarget: "form",
  },
  {
    id: "view-lead",
    title: "View the lead in your admin",
    description: "The application inquiry appears in your admin dashboard for follow-up.",
    preview: "admin",
    initialAdmissionsTab: "submissions",
    animateNewSubmission: true,
    icon: "layoutDashboard",
  },
  {
    id: "send-application-link",
    title: "Start enrollment",
    description:
      "After follow-up, accept the application and send the family their enrollment checklist.",
    preview: "admin",
    icon: "link",
    initialSelectedLeadId: "l0",
    autoSendEnrollmentLink: true,
  },
  {
    id: "parent-enrollment",
    title: "Parents complete enrollment",
    description: "Families complete the enrollment checklist and pay the application fee.",
    preview: "parent",
    initialParentTab: "enrollment",
    icon: "clipboardCheck",
  },
  {
    id: "parent-pays-tuition",
    title: "Parent pays tuition",
    description:
      "Families pay monthly tuition or submit charter fund documentation from the parent portal.",
    preview: "parent",
    initialParentTab: "billing",
    icon: "creditCard",
  },
  {
    id: "teacher-attendance",
    title: "Guides take attendance",
    description: "Staff log project-based session attendance from the teacher portal.",
    preview: "teacher",
    initialTeacherTab: "attendance",
    icon: "clipboardList",
  },
  {
    id: "get-in-touch",
    title: "Ready for next steps?",
    description: "Schedule a meeting, or email or call us to talk through this concept.",
    talkingPoint:
      "Pick a time on the calendar, or reach out directly — we'd love to walk through how this could work for Wild Hearts Adventure Co.",
    preview: "contact",
    icon: "calendarDays",
  },
];

export const naturesSchoolhouseWalkthroughPlaceholder: DemoWalkthroughStep[] = [
  {
    id: "discover",
    title: "Parents discover your school",
    description: "Families find Nature's Schoolhouse online and explore programs in Cedar Park.",
    icon: "globe",
    scrollTarget: "top",
  },
  {
    id: "schedule-tour",
    title: "Parents submit an interest form",
    description: "Parents fill out the interest form to schedule a tour or learn about Full-Time Explorers.",
    icon: "calendarDays",
    scrollTarget: "form",
  },
  {
    id: "view-lead",
    title: "View the lead in your admin",
    description: "The interest form submission appears in your admin dashboard for follow-up.",
    preview: "admin",
    initialAdmissionsTab: "submissions",
    animateNewSubmission: true,
    icon: "layoutDashboard",
  },
  {
    id: "send-application-link",
    title: "Start enrollment",
    description:
      "After follow-up, accept the application and send the family their enrollment checklist.",
    preview: "admin",
    icon: "link",
    initialSelectedLeadId: "l0",
    autoSendEnrollmentLink: true,
  },
  {
    id: "parent-enrollment",
    title: "Parents complete enrollment",
    description: "Families complete the enrollment checklist and pay the application fee.",
    preview: "parent",
    initialParentTab: "enrollment",
    icon: "clipboardCheck",
  },
  {
    id: "parent-pays-tuition",
    title: "Parent pays tuition",
    description:
      "Families pay monthly tuition or apply for need-based financial aid from the parent portal.",
    preview: "parent",
    initialParentTab: "billing",
    icon: "creditCard",
  },
  {
    id: "teacher-attendance",
    title: "Guides take attendance",
    description: "Staff log Tue–Thu core and Discovery Days attendance from the teacher portal.",
    preview: "teacher",
    initialTeacherTab: "attendance",
    icon: "clipboardList",
  },
  {
    id: "get-in-touch",
    title: "Ready for next steps?",
    description: "Schedule a meeting, or email or call us to talk through this concept.",
    talkingPoint:
      "Pick a time on the calendar, or reach out directly — we'd love to walk through how this could work for Nature's Schoolhouse Microschool.",
    preview: "contact",
    icon: "calendarDays",
  },
];

export const theWoodlandsMicroschoolWalkthroughPlaceholder: DemoWalkthroughStep[] = [
  {
    id: "discover",
    title: "Parents discover your school",
    description: "Families find The Woodlands Microschool online and explore programs in Conroe.",
    icon: "globe",
    scrollTarget: "top",
  },
  {
    id: "schedule-tour",
    title: "Parents request a campus tour",
    description: "Parents fill out the tour request form to schedule a visit or learn about program pathways.",
    icon: "calendarDays",
    scrollTarget: "form",
  },
  {
    id: "view-lead",
    title: "View the lead in your admin",
    description: "The tour request appears in your admin dashboard for follow-up.",
    preview: "admin",
    initialAdmissionsTab: "submissions",
    animateNewSubmission: true,
    icon: "layoutDashboard",
  },
  {
    id: "send-application-link",
    title: "Start enrollment",
    description:
      "After follow-up, accept the application and send the family their enrollment checklist.",
    preview: "admin",
    icon: "link",
    initialSelectedLeadId: "l0",
    autoSendEnrollmentLink: true,
  },
  {
    id: "parent-enrollment",
    title: "Parents complete enrollment",
    description: "Families complete the enrollment checklist and pay the application fee.",
    preview: "parent",
    initialParentTab: "enrollment",
    icon: "clipboardCheck",
  },
  {
    id: "parent-pays-tuition",
    title: "Parent pays tuition",
    description:
      "Families pay monthly tuition or manage TEFA funding from the parent portal.",
    preview: "parent",
    initialParentTab: "billing",
    icon: "creditCard",
  },
  {
    id: "teacher-attendance",
    title: "Teachers take attendance",
    description: "Staff log Mon–Thu campus attendance from the teacher portal.",
    preview: "teacher",
    initialTeacherTab: "attendance",
    icon: "clipboardList",
  },
  {
    id: "get-in-touch",
    title: "Ready for next steps?",
    description: "Schedule a meeting, or email or call us to talk through this concept.",
    talkingPoint:
      "Pick a time on the calendar, or reach out directly — we'd love to walk through how this could work for The Woodlands Microschool.",
    preview: "contact",
    icon: "calendarDays",
  },
];

export const monarchHillsWalkthroughPlaceholder: DemoWalkthroughStep[] = [
  {
    id: "discover",
    title: "Parents discover your school",
    description: "Families find you online and explore your outdoor enrichment program.",
    icon: "globe",
    scrollTarget: "top",
  },
  {
    id: "join-interest-list",
    title: "Parents join the interest list",
    description: "Parents submit the interest form to learn more about future enrollment.",
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
    title: "Start enrollment",
    description:
      "After connecting with the family, accept the application and send the family their enrollment checklist.",
    preview: "admin",
    icon: "link",
    initialSelectedLeadId: "l0",
    autoSendEnrollmentLink: true,
  },
  {
    id: "parent-enrollment",
    title: "Parents go through the enrollment",
    description: "Families complete the enrollment checklist from their parent portal.",
    preview: "parent",
    initialParentTab: "enrollment",
    icon: "clipboardCheck",
  },
  {
    id: "parent-pays-tuition",
    title: "Parent pays tuition",
    description:
      "Families pay tuition and manage invoices from the parent portal.",
    preview: "parent",
    initialParentTab: "billing",
    icon: "creditCard",
  },
  {
    id: "teacher-attendance",
    title: "Teachers take attendance",
    description: "Staff track daily attendance from the teacher portal.",
    preview: "teacher",
    initialTeacherTab: "attendance",
    icon: "clipboardList",
  },
  {
    id: "get-in-touch",
    title: "Ready for next steps?",
    description: "Schedule a meeting, or email or call us to talk through this concept.",
    talkingPoint:
      "Pick a time on the calendar, or reach out directly — we'd love to walk through how this could work for your school.",
    preview: "contact",
    icon: "calendarDays",
  },
];

export const zoeLearningHouseWalkthroughPlaceholder: DemoWalkthroughStep[] = [
  {
    id: "discover",
    title: "Parents discover your school",
    description: "Families find you online and explore your holistic Christian K–5 program.",
    icon: "globe",
    scrollTarget: "top",
  },
  {
    id: "submit-interest-form",
    title: "Parents submit the interest form",
    description: "Families share their info and preferred schedule to start a conversation.",
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
    title: "Start enrollment",
    description:
      "After connecting with the family, accept the application and send the family their enrollment checklist.",
    preview: "admin",
    icon: "link",
    initialSelectedLeadId: "l0",
    autoSendEnrollmentLink: true,
  },
  {
    id: "parent-enrollment",
    title: "Parents go through the enrollment",
    description: "Families complete the enrollment checklist from their parent portal.",
    preview: "parent",
    initialParentTab: "enrollment",
    icon: "clipboardCheck",
  },
  {
    id: "parent-pays-tuition",
    title: "Parent pays tuition",
    description:
      "Families pay tuition and manage invoices from the parent portal.",
    preview: "parent",
    initialParentTab: "billing",
    icon: "creditCard",
  },
  {
    id: "teacher-attendance",
    title: "Teachers take attendance",
    description: "Staff track daily attendance from the teacher portal.",
    preview: "teacher",
    initialTeacherTab: "attendance",
    icon: "clipboardList",
  },
  {
    id: "get-in-touch",
    title: "Ready for next steps?",
    description: "Schedule a meeting, or email or call us to talk through this concept.",
    talkingPoint:
      "Pick a time on the calendar, or reach out directly — we'd love to walk through how this could work for your school.",
    preview: "contact",
    icon: "calendarDays",
  },
];

export const hiltonHorizonsAcademyWalkthroughPlaceholder: DemoWalkthroughStep[] = [
  {
    id: "discover",
    title: "Parents discover your school",
    description:
      "Families find you online and explore your project-based K–12 programs across the Tri-Cities.",
    icon: "globe",
    scrollTarget: "top",
  },
  {
    id: "submit-interest-form",
    title: "Parents schedule a tour",
    description: "Families share their info and preferred program to start a conversation.",
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
    title: "Start enrollment",
    description:
      "After connecting with the family, accept the application and send the family their enrollment checklist.",
    preview: "admin",
    icon: "link",
    initialSelectedLeadId: "l0",
    autoSendEnrollmentLink: true,
  },
  {
    id: "parent-enrollment",
    title: "Parents go through the enrollment",
    description: "Families complete the enrollment checklist from their parent portal.",
    preview: "parent",
    initialParentTab: "enrollment",
    icon: "clipboardCheck",
  },
  {
    id: "parent-pays-tuition",
    title: "Parent pays tuition",
    description: "Families pay tuition and manage invoices from the parent portal.",
    preview: "parent",
    initialParentTab: "billing",
    icon: "creditCard",
  },
  {
    id: "teacher-attendance",
    title: "Teachers take attendance",
    description: "Staff track daily attendance from the teacher portal.",
    preview: "teacher",
    initialTeacherTab: "attendance",
    icon: "clipboardList",
  },
  {
    id: "get-in-touch",
    title: "Ready for next steps?",
    description: "Schedule a meeting, or email or call us to talk through this concept.",
    talkingPoint:
      "Pick a time on the calendar, or reach out directly — we'd love to walk through how this could work for your school.",
    preview: "contact",
    icon: "calendarDays",
  },
];

export const micahMissionWalkthroughPlaceholder: DemoWalkthroughStep[] = [
  {
    id: "discover",
    title: "Parents discover your school",
    description: "Families find you online and explore your faith-based K–12 programs.",
    icon: "globe",
    scrollTarget: "top",
  },
  {
    id: "request-information",
    title: "Parents request information",
    description: "Parents submit the inquiry form to start the enrollment conversation.",
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
    title: "Start enrollment",
    description:
      "After connecting with the family, accept the application and send the family their enrollment checklist.",
    preview: "admin",
    icon: "link",
    initialSelectedLeadId: "l0",
    autoSendEnrollmentLink: true,
  },
  {
    id: "parent-enrollment",
    title: "Parents go through the enrollment",
    description: "Families complete the enrollment checklist from their parent portal.",
    preview: "parent",
    initialParentTab: "enrollment",
    icon: "clipboardCheck",
  },
  {
    id: "parent-pays-tuition",
    title: "Parent pays tuition",
    description:
      "Families pay tuition and manage invoices from the parent portal.",
    preview: "parent",
    initialParentTab: "billing",
    icon: "creditCard",
  },
  {
    id: "teacher-attendance",
    title: "Teachers take attendance",
    description: "Staff track daily attendance from the teacher portal.",
    preview: "teacher",
    initialTeacherTab: "attendance",
    icon: "clipboardList",
  },
  {
    id: "get-in-touch",
    title: "Ready for next steps?",
    description: "Schedule a meeting, or email or call us to talk through this concept.",
    talkingPoint:
      "Pick a time on the calendar, or reach out directly — we'd love to walk through how this could work for your school.",
    preview: "contact",
    icon: "calendarDays",
  },
];

export const homeworkHubWalkthroughPlaceholder: DemoWalkthroughStep[] = [
  {
    id: "discover",
    title: "Families discover Homework Hub",
    description:
      "Parents find you online and explore tutoring, test prep, and HwH Academy programs.",
    icon: "globe",
    scrollTarget: "top",
  },
  {
    id: "submit-inquiry",
    title: "Parents submit an enrollment inquiry",
    description: "Families share their info and preferred program to get started.",
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
    title: "Start enrollment",
    description:
      "After connecting with the family, accept the application and send the family their enrollment checklist.",
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
    title: "Parent pays for sessions",
    description: "Families pay for tutoring packages and manage invoices from the parent portal.",
    preview: "parent",
    initialParentTab: "billing",
    icon: "creditCard",
  },
  {
    id: "teacher-attendance",
    title: "Instructors track sessions",
    description: "Staff track tutoring sessions and attendance from the teacher portal.",
    preview: "teacher",
    initialTeacherTab: "attendance",
    icon: "clipboardList",
  },
  {
    id: "get-in-touch",
    title: "Ready for next steps?",
    description: "Schedule a meeting, or email or call us to talk through this concept.",
    talkingPoint:
      "Pick a time on the calendar, or reach out directly — we'd love to walk through how this could work for Homework Hub.",
    preview: "contact",
    icon: "calendarDays",
  },
];

export const ascendMicroSchoolWalkthroughPlaceholder: DemoWalkthroughStep[] = [
  {
    id: "discover",
    title: "Parents discover Ascend Micro School",
    description:
      "Families find you online and explore your faith-based K–8 hybrid programs.",
    icon: "globe",
    scrollTarget: "top",
  },
  {
    id: "discovery-call",
    title: "Parents schedule a tour",
    description: "Parents submit the inquiry form to request a campus visit.",
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
    title: "Start enrollment",
    description:
      "After the tour, accept the application and send the family their enrollment checklist.",
    preview: "admin",
    icon: "link",
    initialSelectedLeadId: "l0",
    autoSendEnrollmentLink: true,
  },
  {
    id: "parent-enrollment",
    title: "Parents go through the enrollment",
    description: "Families complete the enrollment checklist from their parent portal.",
    preview: "parent",
    initialParentTab: "enrollment",
    icon: "clipboardCheck",
  },
  {
    id: "parent-pays-tuition",
    title: "Parent pays tuition",
    description:
      "Families pay tuition and manage invoices from the parent portal.",
    preview: "parent",
    initialParentTab: "billing",
    icon: "creditCard",
  },
  {
    id: "teacher-attendance",
    title: "Teachers take attendance",
    description: "Learning guides track daily attendance from the teacher portal.",
    preview: "teacher",
    initialTeacherTab: "attendance",
    icon: "clipboardList",
  },
  {
    id: "get-in-touch",
    title: "Ready for next steps?",
    description: "Schedule a meeting, or email or call us to talk through this concept.",
    talkingPoint:
      "Pick a time on the calendar, or reach out directly — we'd love to walk through how this could work for Ascend Micro School.",
    preview: "contact",
    icon: "calendarDays",
  },
];

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

function createMobileAppWalkthroughStep(): DemoWalkthroughStep {
  return {
    id: "mobile-app",
    title: "Everything in your pocket",
    description:
      "Messaging, tuition, admissions submissions, attendance, and student profiles — all available in a mobile app built for your school community.",
    talkingPoint:
      "Parents pay tuition and message teachers, admins review admissions submissions, and teachers take attendance — all optimized for mobile.",
    preview: "mobile",
    previewHint:
      "Mobile app preview — features shown here will be available on iOS and Android.",
    previewHintDelayMs: 800,
    icon: "smartphone",
  };
}

const rootedMeadowsMobileAppStep: DemoWalkthroughStep = {
  id: "mobile-app",
  title: "Everything in your pocket",
  description:
    "Messaging, tuition, attendance, student profiles, and committees — all available in a mobile app built for your school community.",
  talkingPoint:
    "Parents and teachers get the features they use most — paying tuition, taking attendance, and looking up student profiles — optimized for mobile.",
  preview: "mobile",
  previewHint:
    "Mobile app preview — features shown here will be available on iOS and Android.",
  previewHintDelayMs: 800,
  icon: "smartphone",
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
        step.id !== "teacher-attendance",
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
          rootedMeadowsMobileAppStep,
          mapped,
        ];
      }
      return [mapped];
    }),
];

export const prestigeHomeschoolAcademyWalkthroughPlaceholder: DemoWalkthroughStep[] = [
  {
    id: "discover",
    title: "Families discover Prestige Homeschool Academy",
    description:
      "Homeschooling families find you online and explore your drop-off programs.",
    icon: "globe",
    scrollTarget: "top",
  },
  {
    id: "apply-inquiry",
    title: "Parents submit an application inquiry",
    description: "Families share their info and preferred program to get started.",
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
    title: "Start enrollment",
    description:
      "After connecting with the family, accept the application and send the family their enrollment checklist.",
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
    description: "Families pay tuition and manage invoices from the parent portal.",
    preview: "parent",
    initialParentTab: "billing",
    icon: "creditCard",
  },
  {
    id: "teacher-attendance",
    title: "Teachers take attendance",
    description: "Staff track daily attendance from the teacher portal.",
    preview: "teacher",
    initialTeacherTab: "attendance",
    icon: "clipboardList",
  },
  {
    id: "get-in-touch",
    title: "Ready for next steps?",
    description: "Schedule a meeting, or email or call us to talk through this concept.",
    talkingPoint:
      "Pick a time on the calendar, or reach out directly — we'd love to walk through how this could work for Prestige Homeschool Academy.",
    preview: "contact",
    icon: "calendarDays",
  },
];

export const arizonaGiftedAcademyWalkthroughPlaceholder: DemoWalkthroughStep[] = [
  {
    id: "discover",
    title: "Families discover Arizona Gifted Academy",
    description:
      "Parents find you online and explore hybrid and full-time pathways for gifted PK–5 learners.",
    icon: "globe",
    scrollTarget: "top",
  },
  {
    id: "apply-inquiry",
    title: "Parents submit an inquiry",
    description:
      "Families share why their gifted or 2e child may benefit from AGA's learning community.",
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
    title: "Start enrollment",
    description:
      "After connecting with the family, accept the application and send the family their enrollment checklist.",
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
    description: "Families pay tuition and manage invoices from the parent portal.",
    preview: "parent",
    initialParentTab: "billing",
    icon: "creditCard",
  },
  {
    id: "teacher-attendance",
    title: "Teachers take attendance",
    description: "Staff track daily attendance from the teacher portal.",
    preview: "teacher",
    initialTeacherTab: "attendance",
    icon: "clipboardList",
  },
  {
    id: "get-in-touch",
    title: "Ready for next steps?",
    description: "Schedule a meeting, or email or call us to talk through this concept.",
    talkingPoint:
      "Pick a time on the calendar, or reach out directly — we'd love to walk through how this could work for Arizona Gifted Academy.",
    preview: "contact",
    icon: "calendarDays",
  },
];

export const springRiverSchoolWalkthroughPlaceholder: DemoWalkthroughStep[] = [
  {
    id: "discover",
    title: "Families discover Spring River School",
    description:
      "Parents find you online and explore Waldorf-inspired homeschool pathways from parent–child through Grade 12.",
    icon: "globe",
    scrollTarget: "top",
  },
  {
    id: "apply-inquiry",
    title: "Parents schedule a tour or inquire",
    description:
      "Families share which programs interest them — outdoor academics, forest school, or high school pathways.",
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
    title: "Start enrollment",
    description:
      "After connecting with the family, accept the application and send the family their enrollment checklist.",
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
    description: "Families pay tuition and manage invoices from the parent portal.",
    preview: "parent",
    initialParentTab: "billing",
    icon: "creditCard",
  },
  {
    id: "teacher-attendance",
    title: "Teachers take attendance",
    description: "Staff track daily attendance from the teacher portal.",
    preview: "teacher",
    initialTeacherTab: "attendance",
    icon: "clipboardList",
  },
  {
    id: "get-in-touch",
    title: "Ready for next steps?",
    description: "Schedule a meeting, or email or call us to talk through this concept.",
    talkingPoint:
      "Pick a time on the calendar, or reach out directly — we'd love to walk through how this could work for Spring River School.",
    preview: "contact",
    icon: "calendarDays",
  },
];

export const lighthouseHomeschoolWalkthroughPlaceholder: DemoWalkthroughStep[] = [
  {
    id: "discover",
    title: "Parents discover your school",
    description: "Families find Lighthouse Homeschool Academy online and explore the hybrid program.",
    icon: "globe",
    scrollTarget: "top",
  },
  {
    id: "inquire",
    title: "Parents request an Information Meeting",
    description: "Parents submit the inquiry form to learn about the hybrid model and next steps.",
    icon: "calendarDays",
    scrollTarget: "form",
  },
  {
    id: "view-lead",
    title: "View the lead in your admin",
    description: "The inquiry appears in your admin dashboard for follow-up.",
    preview: "admin",
    initialAdmissionsTab: "submissions",
    animateNewSubmission: true,
    icon: "layoutDashboard",
  },
  {
    id: "send-application-link",
    title: "Start enrollment",
    description:
      "After follow-up, accept the application and send the family their enrollment checklist.",
    preview: "admin",
    icon: "link",
    initialSelectedLeadId: "l0",
    autoSendEnrollmentLink: true,
  },
  {
    id: "parent-enrollment",
    title: "Parents complete enrollment",
    description: "Families complete the enrollment checklist and pay the $40 application fee.",
    preview: "parent",
    initialParentTab: "enrollment",
    icon: "clipboardCheck",
  },
  {
    id: "parent-pays-tuition",
    title: "Parent pays tuition",
    description: "Families pay $235/month tuition and manage invoices from the parent portal.",
    preview: "parent",
    initialParentTab: "billing",
    icon: "creditCard",
  },
  {
    id: "teacher-attendance",
    title: "Teachers take attendance",
    description: "Staff log on-campus day attendance from the teacher portal.",
    preview: "teacher",
    initialTeacherTab: "attendance",
    icon: "clipboardList",
  },
  {
    id: "get-in-touch",
    title: "Ready for next steps?",
    description: "Schedule a meeting, or email or call us to talk through this concept.",
    talkingPoint:
      "Pick a time on the calendar, or reach out directly — we'd love to walk through how this could work for Lighthouse Homeschool Academy.",
    preview: "contact",
    icon: "calendarDays",
  },
];

export const luffLearningWalkthroughPlaceholder: DemoWalkthroughStep[] = [
  {
    id: "discover",
    title: "Parents discover your school",
    description: "Families find Luff Learning online and explore fine arts programs and the Virtual Academy.",
    icon: "globe",
    scrollTarget: "top",
  },
  {
    id: "inquire",
    title: "Parents schedule a tour",
    description: "Parents submit the contact form to learn about programs, open house events, or next steps.",
    icon: "calendarDays",
    scrollTarget: "form",
  },
  {
    id: "view-lead",
    title: "View the lead in your admin",
    description: "The inquiry appears in your admin dashboard for follow-up.",
    preview: "admin",
    initialAdmissionsTab: "submissions",
    animateNewSubmission: true,
    icon: "layoutDashboard",
  },
  {
    id: "send-application-link",
    title: "Start enrollment",
    description:
      "After follow-up, accept the application and send the family their enrollment checklist.",
    preview: "admin",
    icon: "link",
    initialSelectedLeadId: "l0",
    autoSendEnrollmentLink: true,
  },
  {
    id: "parent-enrollment",
    title: "Parents complete enrollment",
    description: "Families complete the enrollment checklist and submit required forms.",
    preview: "parent",
    initialParentTab: "enrollment",
    icon: "clipboardCheck",
  },
  {
    id: "parent-pays-tuition",
    title: "Parent pays tuition",
    description: "Families pay monthly tuition and manage invoices from the parent portal.",
    preview: "parent",
    initialParentTab: "billing",
    icon: "creditCard",
  },
  {
    id: "teacher-attendance",
    title: "Teachers take attendance",
    description: "Staff log theatre class and program attendance from the teacher portal.",
    preview: "teacher",
    initialTeacherTab: "attendance",
    icon: "clipboardList",
  },
  {
    id: "get-in-touch",
    title: "Ready for next steps?",
    description: "Schedule a meeting, or email or call us to talk through this concept.",
    talkingPoint:
      "Pick a time on the calendar, or reach out directly — we'd love to walk through how this could work for Luff Learning Fine Arts Academy.",
    preview: "contact",
    icon: "calendarDays",
  },
];

export const paradiseEarthAcademyWalkthroughPlaceholder: DemoWalkthroughStep[] = [
  {
    id: "discover",
    title: "Parents discover your school",
    description: "Families find Paradise Earth Academy online and explore holistic K-8 programs, nature days, and flexible enrollment.",
    icon: "globe",
    scrollTarget: "top",
  },
  {
    id: "waitlist",
    title: "Parents join the waitlist",
    description: "Parents submit the waitlist form to schedule a tour or learn about 1–4 day academic programs and Nature Day.",
    icon: "calendarDays",
    scrollTarget: "form",
  },
  {
    id: "view-lead",
    title: "View the lead in your admin",
    description: "The waitlist inquiry appears in your admin dashboard for follow-up.",
    preview: "admin",
    initialAdmissionsTab: "submissions",
    animateNewSubmission: true,
    icon: "layoutDashboard",
  },
  {
    id: "send-application-link",
    title: "Start enrollment",
    description:
      "After follow-up, accept the application and send the family their enrollment checklist.",
    preview: "admin",
    icon: "link",
    initialSelectedLeadId: "l0",
    autoSendEnrollmentLink: true,
  },
  {
    id: "parent-enrollment",
    title: "Parents complete enrollment",
    description: "Families complete the enrollment checklist and submit required forms.",
    preview: "parent",
    initialParentTab: "enrollment",
    icon: "clipboardCheck",
  },
  {
    id: "parent-pays-tuition",
    title: "Parent pays quarterly tuition",
    description: "Families pay quarterly tuition via Class Wallet and manage invoices from the parent portal.",
    preview: "parent",
    initialParentTab: "billing",
    icon: "creditCard",
  },
  {
    id: "teacher-attendance",
    title: "Teachers take attendance",
    description: "Staff log academic day and garden elective attendance from the teacher portal.",
    preview: "teacher",
    initialTeacherTab: "attendance",
    icon: "clipboardList",
  },
  {
    id: "get-in-touch",
    title: "Ready for next steps?",
    description: "Schedule a meeting, or email or call us to talk through this concept.",
    talkingPoint:
      "Pick a time on the calendar, or reach out directly — we'd love to walk through how this could work for Paradise Earth Academy.",
    preview: "contact",
    icon: "calendarDays",
  },
];

export const creationAcresWalkthroughPlaceholder: DemoWalkthroughStep[] = [
  {
    id: "discover",
    title: "Parents discover Creation Acres",
    description:
      "Families find you online and explore your Christ-centered Montessori programs.",
    icon: "globe",
    scrollTarget: "top",
  },
  {
    id: "discovery-call",
    title: "Parents request information",
    description: "Parents submit the inquiry form to schedule a tour or ask questions.",
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
    title: "Start enrollment",
    description:
      "After the tour or interview, accept the application and send the family their enrollment checklist.",
    preview: "admin",
    icon: "link",
    initialSelectedLeadId: "l0",
    autoSendEnrollmentLink: true,
  },
  {
    id: "parent-enrollment",
    title: "Parents go through the enrollment",
    description: "Families complete the enrollment checklist from their parent portal.",
    preview: "parent",
    initialParentTab: "enrollment",
    icon: "clipboardCheck",
  },
  {
    id: "parent-pays-tuition",
    title: "Parent pays tuition",
    description:
      "Families pay tuition and manage invoices from the parent portal.",
    preview: "parent",
    initialParentTab: "billing",
    icon: "creditCard",
  },
  {
    id: "teacher-attendance",
    title: "Guides take attendance",
    description: "Montessori guides track daily attendance from the teacher portal.",
    preview: "teacher",
    initialTeacherTab: "attendance",
    icon: "clipboardList",
  },
  {
    id: "get-in-touch",
    title: "Ready for next steps?",
    description: "Schedule a meeting, or email or call us to talk through this concept.",
    talkingPoint:
      "Pick a time on the calendar, or reach out directly — we'd love to walk through how this could work for Creation Acres Montessori.",
    preview: "contact",
    icon: "calendarDays",
  },
];

export const trueNorthWalkthroughPlaceholder: DemoWalkthroughStep[] = [
  {
    id: "discover",
    title: "Parents discover True North",
    description:
      "Families find you online and explore your Christian parent partnership programs.",
    icon: "globe",
    scrollTarget: "top",
  },
  {
    id: "discovery-call",
    title: "Parents request information",
    description: "Parents submit the inquiry form to learn more or watch info videos.",
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
    title: "Start enrollment",
    description:
      "After the info meeting, accept the application and send the family their enrollment checklist.",
    preview: "admin",
    icon: "link",
    initialSelectedLeadId: "l0",
    autoSendEnrollmentLink: true,
  },
  {
    id: "parent-enrollment",
    title: "Parents go through the enrollment",
    description: "Families complete the enrollment checklist from their parent portal.",
    preview: "parent",
    initialParentTab: "enrollment",
    icon: "clipboardCheck",
  },
  {
    id: "parent-pays-tuition",
    title: "Parent pays tuition",
    description:
      "Families pay $417/month tuition and manage invoices from the parent portal.",
    preview: "parent",
    initialParentTab: "billing",
    icon: "creditCard",
  },
  {
    id: "teacher-attendance",
    title: "Teachers take attendance",
    description: "Instructors track Tuesday and Thursday attendance from the teacher portal.",
    preview: "teacher",
    initialTeacherTab: "attendance",
    icon: "clipboardList",
  },
  {
    id: "get-in-touch",
    title: "Ready for next steps?",
    description: "Schedule a meeting, or email or call us to talk through this concept.",
    talkingPoint:
      "Pick a time on the calendar, or reach out directly — we'd love to walk through how this could work for True North.",
    preview: "contact",
    icon: "calendarDays",
  },
];

export const oneAcreFarmWalkthroughPlaceholder: DemoWalkthroughStep[] = [
  {
    id: "discover",
    title: "Parents discover One Acre Farm",
    description:
      "Families find you online and explore Farm School learning pods and monthly activities.",
    icon: "globe",
    scrollTarget: "top",
  },
  {
    id: "discovery-call",
    title: "Parents submit a tour application",
    description: "Parents fill out the tour application to schedule a visit with their child.",
    icon: "calendarDays",
    scrollTarget: "form",
  },
  {
    id: "view-lead",
    title: "View the tour lead in your admin",
    description: "The tour application appears in your admin dashboard so you can follow up.",
    preview: "admin",
    initialAdmissionsTab: "submissions",
    animateNewSubmission: true,
    icon: "layoutDashboard",
  },
  {
    id: "send-application-link",
    title: "Start enrollment",
    description:
      "After the tour, accept the application and send the family their enrollment checklist.",
    preview: "admin",
    icon: "link",
    initialSelectedLeadId: "l0",
    autoSendEnrollmentLink: true,
  },
  {
    id: "parent-enrollment",
    title: "Parents complete enrollment",
    description: "Families complete the enrollment checklist from their parent portal.",
    preview: "parent",
    initialParentTab: "enrollment",
    icon: "clipboardCheck",
  },
  {
    id: "parent-pays-tuition",
    title: "Parent pays tuition",
    description:
      "Families pay $625/month tuition and manage invoices from the parent portal.",
    preview: "parent",
    initialParentTab: "billing",
    icon: "creditCard",
  },
  {
    id: "teacher-attendance",
    title: "Teachers take attendance",
    description: "Instructors track Farm School outdoor session attendance from the teacher portal.",
    preview: "teacher",
    initialTeacherTab: "attendance",
    icon: "clipboardList",
  },
  {
    id: "get-in-touch",
    title: "Ready for next steps?",
    description: "Schedule a meeting, or email or call us to talk through this concept.",
    talkingPoint:
      "Pick a time on the calendar, or reach out directly — we'd love to walk through how this could work for One Acre Farm.",
    preview: "contact",
    icon: "calendarDays",
  },
];

export const labLearningWalkthroughPlaceholder: DemoWalkthroughStep[] = [
  {
    id: "discover",
    title: "Parents discover The Lab",
    description:
      "Families find you online and explore WOW!, a la carte classes, and your mastery-based approach.",
    icon: "globe",
    scrollTarget: "top",
  },
  {
    id: "discovery-call",
    title: "Parents schedule a tour",
    description: "Parents submit the inquiry form to schedule a virtual or in-person tour.",
    icon: "calendarDays",
    scrollTarget: "form",
  },
  {
    id: "view-lead",
    title: "View the lead in your admin",
    description: "The tour request appears in your admin dashboard so you can follow up.",
    preview: "admin",
    initialAdmissionsTab: "submissions",
    animateNewSubmission: true,
    icon: "layoutDashboard",
  },
  {
    id: "send-application-link",
    title: "Start enrollment",
    description:
      "After the tour, accept the application and send the family their enrollment checklist.",
    preview: "admin",
    icon: "link",
    initialSelectedLeadId: "l0",
    autoSendEnrollmentLink: true,
  },
  {
    id: "parent-enrollment",
    title: "Parents complete enrollment",
    description: "Families complete enrollment and schedule their Family Huddle from the parent portal.",
    preview: "parent",
    initialParentTab: "enrollment",
    icon: "clipboardCheck",
  },
  {
    id: "parent-pays-tuition",
    title: "Parent pays tuition",
    description:
      "Families pay semester tuition or apply charter PO funds from the parent portal.",
    preview: "parent",
    initialParentTab: "billing",
    icon: "creditCard",
  },
  {
    id: "teacher-attendance",
    title: "Teachers take attendance",
    description: "Advisors track WOW! day attendance from the teacher portal.",
    preview: "teacher",
    initialTeacherTab: "attendance",
    icon: "clipboardList",
  },
  {
    id: "get-in-touch",
    title: "Ready for next steps?",
    description: "Schedule a meeting, or email or call us to talk through this concept.",
    talkingPoint:
      "Pick a time on the calendar, or reach out directly — we'd love to walk through how this could work for The Lab Learning Space.",
    preview: "contact",
    icon: "calendarDays",
  },
];

export const kineoSchoolWalkthroughPlaceholder: DemoWalkthroughStep[] = [
  {
    id: "discover",
    title: "Parents discover your school",
    description:
      "Families find The Kineo School online and explore individualized K-5 programs and neurodivergent support.",
    icon: "globe",
    scrollTarget: "top",
  },
  {
    id: "inquire",
    title: "Parents schedule a visit",
    description:
      "Parents submit the contact form to book a campus tour or learn about K-5 enrollment.",
    icon: "calendarDays",
    scrollTarget: "form",
  },
  {
    id: "view-lead",
    title: "View the lead in your admin",
    description: "The inquiry appears in your admin dashboard for follow-up.",
    preview: "admin",
    initialAdmissionsTab: "submissions",
    animateNewSubmission: true,
    icon: "layoutDashboard",
  },
  {
    id: "send-application-link",
    title: "Start enrollment",
    description:
      "After follow-up, accept the application and send the family their enrollment checklist.",
    preview: "admin",
    icon: "link",
    initialSelectedLeadId: "l0",
    autoSendEnrollmentLink: true,
  },
  {
    id: "parent-enrollment",
    title: "Parents complete enrollment",
    description: "Families complete the enrollment checklist and submit required forms.",
    preview: "parent",
    initialParentTab: "enrollment",
    icon: "clipboardCheck",
  },
  {
    id: "parent-pays-tuition",
    title: "Parent pays tuition",
    description: "Families pay tuition and manage invoices from the parent portal.",
    preview: "parent",
    initialParentTab: "billing",
    icon: "creditCard",
  },
  {
    id: "teacher-attendance",
    title: "Teachers take attendance",
    description: "Staff log K-5 cohort and program attendance from the teacher portal.",
    preview: "teacher",
    initialTeacherTab: "attendance",
    icon: "clipboardList",
  },
  {
    id: "get-in-touch",
    title: "Ready for next steps?",
    description: "Schedule a meeting, or email or call us to talk through this concept.",
    talkingPoint:
      "Pick a time on the calendar, or reach out directly — we'd love to walk through how this could work for The Kineo School.",
    preview: "contact",
    icon: "calendarDays",
  },
];

export const austinMicroSchoolWalkthroughPlaceholder: DemoWalkthroughStep[] = [
  {
    id: "discover",
    title: "Parents discover your school",
    description:
      "Families find Austin Micro School online and explore K–12 programs, the Day Pass experience, and flexible enrollment options in South Austin.",
    icon: "globe",
    scrollTarget: "top",
  },
  {
    id: "inquire",
    title: "Parents book a family tour",
    description:
      "Parents submit the contact form to schedule a 20-minute tour and activate their free Young Leader Day Pass.",
    icon: "calendarDays",
    scrollTarget: "form",
  },
  {
    id: "view-lead",
    title: "View the lead in your admin",
    description: "The tour and Day Pass inquiry appears in your admin dashboard for follow-up.",
    preview: "admin",
    initialAdmissionsTab: "submissions",
    animateNewSubmission: true,
    icon: "layoutDashboard",
  },
  {
    id: "send-application-link",
    title: "Start enrollment",
    description:
      "After the Day Pass and Learning Profile, accept the application and send the family their enrollment checklist.",
    preview: "admin",
    icon: "link",
    initialSelectedLeadId: "l0",
    autoSendEnrollmentLink: true,
  },
  {
    id: "parent-enrollment",
    title: "Parents complete enrollment",
    description: "Families complete the enrollment checklist and submit required forms.",
    preview: "parent",
    initialParentTab: "enrollment",
    icon: "clipboardCheck",
  },
  {
    id: "parent-pays-tuition",
    title: "Parent pays tuition",
    description: "Families pay tuition and manage invoices from the parent portal.",
    preview: "parent",
    initialParentTab: "billing",
    icon: "creditCard",
  },
  {
    id: "teacher-attendance",
    title: "Teachers take attendance",
    description: "Staff log full-time, hybrid, and program attendance from the teacher portal.",
    preview: "teacher",
    initialTeacherTab: "attendance",
    icon: "clipboardList",
  },
  {
    id: "get-in-touch",
    title: "Ready for next steps?",
    description: "Schedule a meeting, or email or call us to talk through this concept.",
    talkingPoint:
      "Pick a time on the calendar, or reach out directly — we'd love to walk through how this could work for Austin Micro School.",
    preview: "contact",
    icon: "calendarDays",
  },
];

export const katsCommunityMicroschoolWalkthroughPlaceholder: DemoWalkthroughStep[] = [
  {
    id: "discover",
    title: "Parents discover your school",
    description:
      "Families find Kat's Community Microschool online and explore personalized learning, AZ ESA support, and the small-class experience.",
    icon: "globe",
    scrollTarget: "top",
  },
  {
    id: "inquire",
    title: "Parents schedule a visit",
    description:
      "Parents submit the contact form to schedule a visit, ask about AZ ESA enrollment, or learn about grades 3–6.",
    icon: "calendarDays",
    scrollTarget: "form",
  },
  {
    id: "view-lead",
    title: "View the lead in your admin",
    description: "The inquiry appears in your admin dashboard for follow-up.",
    preview: "admin",
    initialAdmissionsTab: "submissions",
    animateNewSubmission: true,
    icon: "layoutDashboard",
  },
  {
    id: "send-application-link",
    title: "Start enrollment",
    description:
      "After follow-up, accept the application and send the family their enrollment checklist.",
    preview: "admin",
    icon: "link",
    initialSelectedLeadId: "l0",
    autoSendEnrollmentLink: true,
  },
  {
    id: "parent-enrollment",
    title: "Parents complete enrollment",
    description: "Families complete the enrollment checklist and submit required forms.",
    preview: "parent",
    initialParentTab: "enrollment",
    icon: "clipboardCheck",
  },
  {
    id: "parent-pays-tuition",
    title: "Families manage ESA enrollment",
    description:
      "Families track AZ ESA enrollment steps and manage any remaining paperwork from the parent portal.",
    preview: "parent",
    initialParentTab: "billing",
    icon: "creditCard",
  },
  {
    id: "teacher-attendance",
    title: "Teachers take attendance",
    description: "Kathleen logs daily attendance and tracks student progress from the teacher portal.",
    preview: "teacher",
    initialTeacherTab: "attendance",
    icon: "clipboardList",
  },
  createMobileAppWalkthroughStep(),
  {
    id: "get-in-touch",
    title: "Ready for next steps?",
    description: "Schedule a meeting, or email or call us to talk through this concept.",
    talkingPoint:
      "Pick a time on the calendar, or reach out directly — we'd love to walk through how this could work for Kat's Community Microschool.",
    preview: "contact",
    icon: "calendarDays",
  },
];

export const kinderAcademyPrepSchoolWalkthroughPlaceholder: DemoWalkthroughStep[] = [
  {
    id: "discover",
    title: "Parents discover your school",
    description:
      "Families find Kinder Academy Prep School online and explore personalized learning, TEFA support, and the 10-student maximum.",
    icon: "globe",
    scrollTarget: "top",
  },
  {
    id: "inquire",
    title: "Parents request enrollment information",
    description:
      "Parents submit the contact form to ask about the 2026–27 microschool, summer camps, tutoring, or extended day.",
    icon: "calendarDays",
    scrollTarget: "form",
  },
  {
    id: "view-lead",
    title: "View the lead in your admin",
    description: "The inquiry appears in your admin dashboard for follow-up.",
    preview: "admin",
    initialAdmissionsTab: "submissions",
    animateNewSubmission: true,
    icon: "layoutDashboard",
  },
  {
    id: "send-application-link",
    title: "Start enrollment",
    description:
      "After follow-up, accept the application and send the family their enrollment checklist.",
    preview: "admin",
    icon: "link",
    initialSelectedLeadId: "l0",
    autoSendEnrollmentLink: true,
  },
  {
    id: "parent-enrollment",
    title: "Parents complete enrollment",
    description: "Families complete the enrollment checklist and submit required forms.",
    preview: "parent",
    initialParentTab: "enrollment",
    icon: "clipboardCheck",
  },
  {
    id: "parent-pays-tuition",
    title: "Families manage tuition",
    description:
      "Families track enrollment steps and manage tuition payments from the parent portal.",
    preview: "parent",
    initialParentTab: "billing",
    icon: "creditCard",
  },
  {
    id: "teacher-attendance",
    title: "Teachers take attendance",
    description: "Kimberly logs daily attendance and tracks student progress from the teacher portal.",
    preview: "teacher",
    initialTeacherTab: "attendance",
    icon: "clipboardList",
  },
  createMobileAppWalkthroughStep(),
  {
    id: "get-in-touch",
    title: "Ready for next steps?",
    description: "Schedule a meeting, or email or call us to talk through this concept.",
    talkingPoint:
      "Pick a time on the calendar, or reach out directly — we'd love to walk through how this could work for Kinder Academy Prep School.",
    preview: "contact",
    icon: "calendarDays",
  },
];

export const naplesMicroschoolsWalkthroughPlaceholder: DemoWalkthroughStep[] = [
  {
    id: "discover",
    title: "Parents discover your school",
    description:
      "Families find Naples MicroSchools online and explore NatureQuest, CoreQuest, and farm-based homeschool pathways.",
    icon: "globe",
    scrollTarget: "top",
  },
  {
    id: "inquire",
    title: "Parents request a discovery call",
    description:
      "Parents submit the inquiry form to schedule a discovery call, ask about programs, or join the wait list.",
    icon: "calendarDays",
    scrollTarget: "form",
  },
  {
    id: "view-lead",
    title: "View the lead in your admin",
    description: "The discovery call request appears in your admin dashboard for follow-up.",
    preview: "admin",
    initialAdmissionsTab: "submissions",
    animateNewSubmission: true,
    icon: "layoutDashboard",
  },
  {
    id: "send-application-link",
    title: "Start enrollment",
    description:
      "After the discovery call and farm tour, accept the application and send the family their enrollment checklist.",
    preview: "admin",
    icon: "link",
    initialSelectedLeadId: "l0",
    autoSendEnrollmentLink: true,
  },
  {
    id: "parent-enrollment",
    title: "Parents complete enrollment",
    description: "Families complete the enrollment checklist and submit required forms.",
    preview: "parent",
    initialParentTab: "enrollment",
    icon: "clipboardCheck",
  },
  {
    id: "parent-pays-tuition",
    title: "Families manage tuition",
    description:
      "Families track enrollment steps and manage quarterly tuition payments from the parent portal.",
    preview: "parent",
    initialParentTab: "billing",
    icon: "creditCard",
  },
  {
    id: "teacher-attendance",
    title: "Teachers take attendance",
    description: "Learning Guides log daily attendance for NatureQuest and program rosters.",
    preview: "teacher",
    initialTeacherTab: "attendance",
    icon: "clipboardList",
  },
  createMobileAppWalkthroughStep(),
  {
    id: "get-in-touch",
    title: "Ready for next steps?",
    description: "Schedule a meeting, or email or call us to talk through this concept.",
    talkingPoint:
      "Pick a time on the calendar, or reach out directly — we'd love to walk through how this could work for Naples MicroSchools.",
    preview: "contact",
    icon: "calendarDays",
  },
];

export const theFocusAcademyWalkthroughPlaceholder: DemoWalkthroughStep[] = [
  {
    id: "discover",
    title: "Parents discover your school",
    description:
      "Families find The FOCUS Academy online and explore strengths-based learning for twice-exceptional middle-school boys.",
    icon: "globe",
    scrollTarget: "top",
  },
  {
    id: "inquire",
    title: "Parents start a conversation",
    description:
      "Parents submit the inquiry form to connect about program fit, 4-Day or 2-Day options, and 2026–27 enrollment.",
    icon: "calendarDays",
    scrollTarget: "form",
  },
  {
    id: "view-lead",
    title: "View the lead in your admin",
    description:
      "The family conversation request appears in your admin dashboard for follow-up.",
    preview: "admin",
    initialAdmissionsTab: "submissions",
    animateNewSubmission: true,
    icon: "layoutDashboard",
  },
  {
    id: "send-application-link",
    title: "Start enrollment",
    description:
      "After the family conversation, accept the application and send the family their enrollment checklist.",
    preview: "admin",
    icon: "link",
    initialSelectedLeadId: "l0",
    autoSendEnrollmentLink: true,
  },
  {
    id: "parent-enrollment",
    title: "Parents complete enrollment",
    description:
      "Families complete the enrollment checklist and submit required forms.",
    preview: "parent",
    initialParentTab: "enrollment",
    icon: "clipboardCheck",
  },
  {
    id: "parent-pays-tuition",
    title: "Families manage tuition",
    description:
      "Families track enrollment steps and manage tuition payments from the parent portal.",
    preview: "parent",
    initialParentTab: "billing",
    icon: "creditCard",
  },
  {
    id: "teacher-attendance",
    title: "Teachers take attendance",
    description:
      "Learning guides log daily attendance for 4-Day and 2-Day program rosters.",
    preview: "teacher",
    initialTeacherTab: "attendance",
    icon: "clipboardList",
  },
  createMobileAppWalkthroughStep(),
  {
    id: "get-in-touch",
    title: "Ready for next steps?",
    description:
      "Schedule a meeting, or email or call us to talk through this concept.",
    talkingPoint:
      "Pick a time on the calendar, or reach out directly — we'd love to walk through how this could work for The FOCUS Academy.",
    preview: "contact",
    icon: "calendarDays",
  },
];

export const piedmontForestSchoolWalkthroughPlaceholder: DemoWalkthroughStep[] = [
  {
    id: "discover",
    title: "Parents discover your school",
    description:
      "Families find Piedmont Forest School online and explore forest kindergarten, nature explorers, and the new Agile Learning Center at Little Creek Park.",
    icon: "globe",
    scrollTarget: "top",
  },
  {
    id: "inquire",
    title: "Parents start an enrollment inquiry",
    description:
      "Parents submit the inquiry form to connect about program fit, tour timing, and 2026–27 enrollment at Little Creek Park.",
    icon: "calendarDays",
    scrollTarget: "form",
  },
  {
    id: "view-lead",
    title: "View the inquiry in your admin",
    description:
      "The enrollment inquiry appears in your admin dashboard for follow-up within 72 business hours.",
    preview: "admin",
    initialAdmissionsTab: "submissions",
    animateNewSubmission: true,
    icon: "layoutDashboard",
  },
  {
    id: "send-application-link",
    title: "Start enrollment",
    description:
      "After the site tour and program confirmation, accept the application and send the family their enrollment checklist.",
    preview: "admin",
    icon: "link",
    initialSelectedLeadId: "l0",
    autoSendEnrollmentLink: true,
  },
  {
    id: "parent-enrollment",
    title: "Parents complete enrollment",
    description:
      "Families complete the enrollment checklist and submit required forms.",
    preview: "parent",
    initialParentTab: "enrollment",
    icon: "clipboardCheck",
  },
  {
    id: "parent-pays-tuition",
    title: "Families manage tuition",
    description:
      "Families track enrollment steps and manage tuition payments from the parent portal.",
    preview: "parent",
    initialParentTab: "billing",
    icon: "creditCard",
  },
  {
    id: "teacher-attendance",
    title: "Learning Partners take attendance",
    description:
      "Learning Partners log daily attendance for Forest Kindergarten and program rosters.",
    preview: "teacher",
    initialTeacherTab: "attendance",
    icon: "clipboardList",
  },
  createMobileAppWalkthroughStep(),
  {
    id: "get-in-touch",
    title: "Ready for next steps?",
    description:
      "Schedule a meeting, or email or call us to talk through this concept.",
    talkingPoint:
      "Pick a time on the calendar, or reach out directly — we'd love to walk through how this could work for Piedmont Forest School.",
    preview: "contact",
    icon: "calendarDays",
  },
];

export const littleSprigsTampaWalkthroughPlaceholder: DemoWalkthroughStep[] = [
  {
    id: "discover",
    title: "Families discover Little Sprigs",
    description:
      "Tampa Bay families find Little Sprigs of Tampa online and explore the play-based meetup community rooted in The Homeschool Village.",
    icon: "globe",
    scrollTarget: "top",
  },
  {
    id: "inquire",
    title: "Families connect with the community",
    description:
      "Parents submit the community inquiry form to learn about upcoming meetups and how to join Little Sprigs.",
    icon: "calendarDays",
    scrollTarget: "form",
  },
  {
    id: "view-lead",
    title: "View the inquiry in your admin",
    description:
      "The community inquiry appears in your admin dashboard for follow-up.",
    preview: "admin",
    initialAdmissionsTab: "submissions",
    animateNewSubmission: true,
    icon: "layoutDashboard",
  },
  {
    id: "send-application-link",
    title: "Start enrollment",
    description:
      "After connecting about meetups or program fit, accept the application and send the family their enrollment checklist.",
    preview: "admin",
    icon: "link",
    initialSelectedLeadId: "l0",
    autoSendEnrollmentLink: true,
  },
  {
    id: "parent-enrollment",
    title: "Parents complete enrollment",
    description:
      "Families complete the enrollment checklist and submit required forms.",
    preview: "parent",
    initialParentTab: "enrollment",
    icon: "clipboardCheck",
  },
  {
    id: "parent-pays-tuition",
    title: "Families manage tuition",
    description:
      "Families track enrollment steps and manage tuition payments from the parent portal.",
    preview: "parent",
    initialParentTab: "billing",
    icon: "creditCard",
  },
  {
    id: "teacher-attendance",
    title: "Teachers take attendance",
    description:
      "Teachers log daily attendance for Little Sprigs and program rosters.",
    preview: "teacher",
    initialTeacherTab: "attendance",
    icon: "clipboardList",
  },
  createMobileAppWalkthroughStep(),
  {
    id: "get-in-touch",
    title: "Ready for next steps?",
    description:
      "Schedule a meeting, or email or call us to talk through this concept.",
    talkingPoint:
      "Pick a time on the calendar, or reach out directly — we'd love to walk through how this could work for Little Sprigs of Tampa.",
    preview: "contact",
    icon: "calendarDays",
  },
];

export const actonAcademyPittsburghWalkthroughPlaceholder: DemoWalkthroughStep[] = [
  {
    id: "discover",
    title: "Parents discover your school",
    description:
      "Families find Acton Academy Pittsburgh online and explore learner-driven education, studio pathways, and scholarships in Wexford.",
    icon: "globe",
    scrollTarget: "top",
  },
  {
    id: "inquire",
    title: "Parents book a call",
    description:
      "Parents submit the inquiry form to schedule a conversation about studio fit and Pre-K–8 enrollment.",
    icon: "calendarDays",
    scrollTarget: "form",
  },
  {
    id: "view-lead",
    title: "View the inquiry in your admin",
    description:
      "The book-a-call inquiry appears in your admin dashboard for follow-up.",
    preview: "admin",
    initialAdmissionsTab: "submissions",
    animateNewSubmission: true,
    icon: "layoutDashboard",
  },
  {
    id: "send-application-link",
    title: "Start enrollment",
    description:
      "After the campus tour and learner visit, accept the application and send the family their enrollment checklist.",
    preview: "admin",
    icon: "link",
    initialSelectedLeadId: "l0",
    autoSendEnrollmentLink: true,
  },
  {
    id: "parent-enrollment",
    title: "Parents complete enrollment",
    description:
      "Families complete the enrollment checklist and submit required forms.",
    preview: "parent",
    initialParentTab: "enrollment",
    icon: "clipboardCheck",
  },
  {
    id: "parent-pays-tuition",
    title: "Families manage tuition",
    description:
      "Families track enrollment steps and manage tuition payments from the parent portal.",
    preview: "parent",
    initialParentTab: "billing",
    icon: "creditCard",
  },
  {
    id: "teacher-attendance",
    title: "Guides take attendance",
    description:
      "Studio guides log daily attendance for Spark, Elementary, and Middle School rosters.",
    preview: "teacher",
    initialTeacherTab: "attendance",
    icon: "clipboardList",
  },
  createMobileAppWalkthroughStep(),
  {
    id: "get-in-touch",
    title: "Ready for next steps?",
    description:
      "Schedule a meeting, or email or call us to talk through this concept.",
    talkingPoint:
      "Pick a time on the calendar, or reach out directly — we'd love to walk through how this could work for Acton Academy Pittsburgh.",
    preview: "contact",
    icon: "calendarDays",
  },
];

export const actonAcademyPlacerWalkthroughPlaceholder: DemoWalkthroughStep[] = [
  {
    id: "discover",
    title: "Parents discover your school",
    description:
      "Families find Acton Academy Placer online and explore learner-driven education, four studio pathways, and three campuses across the Placer region.",
    icon: "globe",
    scrollTarget: "top",
  },
  {
    id: "inquire",
    title: "Parents request the guide",
    description:
      "Parents submit the form to download the free Parent Guide and share their studio and campus interest.",
    icon: "calendarDays",
    scrollTarget: "form",
  },
  {
    id: "view-lead",
    title: "View the inquiry in your admin",
    description:
      "The parent guide request appears in your admin dashboard for follow-up.",
    preview: "admin",
    initialAdmissionsTab: "submissions",
    animateNewSubmission: true,
    icon: "layoutDashboard",
  },
  {
    id: "send-application-link",
    title: "Start enrollment",
    description:
      "After the info session and learner audition, accept the application and send the family their enrollment checklist.",
    preview: "admin",
    icon: "link",
    initialSelectedLeadId: "l0",
    autoSendEnrollmentLink: true,
  },
  {
    id: "parent-enrollment",
    title: "Parents complete enrollment",
    description:
      "Families complete the enrollment checklist and submit required forms.",
    preview: "parent",
    initialParentTab: "enrollment",
    icon: "clipboardCheck",
  },
  {
    id: "parent-pays-tuition",
    title: "Families manage tuition",
    description:
      "Families track enrollment steps and manage tuition payments from the parent portal.",
    preview: "parent",
    initialParentTab: "billing",
    icon: "creditCard",
  },
  {
    id: "teacher-attendance",
    title: "Guides take attendance",
    description:
      "Studio guides log daily attendance for Spark, Threshold, Discovery, and Launchpad rosters.",
    preview: "teacher",
    initialTeacherTab: "attendance",
    icon: "clipboardList",
  },
  createMobileAppWalkthroughStep(),
  {
    id: "get-in-touch",
    title: "Ready for next steps?",
    description:
      "Schedule a meeting, or email or call us to talk through this concept.",
    talkingPoint:
      "Pick a time on the calendar, or reach out directly — we'd love to walk through how this could work for Acton Academy Placer.",
    preview: "contact",
    icon: "calendarDays",
  },
];

export const gatheredOakFarmWalkthroughPlaceholder: DemoWalkthroughStep[] = [
  {
    id: "discover",
    title: "Parents discover Gathered Oak Farm",
    description:
      "Families find Gathered Oak Farm online and explore farm-school programs, the barn classroom, and the 2.5-acre outdoor learning environment in Fallbrook.",
    icon: "globe",
    scrollTarget: "top",
  },
  {
    id: "inquire",
    title: "Parents plan a visit",
    description:
      "Parents submit the inquiry form to learn about program fit, schedules, and how to visit the farm in person.",
    icon: "calendarDays",
    scrollTarget: "form",
  },
  {
    id: "view-lead",
    title: "View the inquiry in your admin",
    description:
      "The visit inquiry appears in your admin dashboard for follow-up.",
    preview: "admin",
    initialAdmissionsTab: "submissions",
    animateNewSubmission: true,
    icon: "layoutDashboard",
  },
  {
    id: "send-application-link",
    title: "Start enrollment",
    description:
      "After the farm visit and program confirmation, accept the application and send the family their enrollment checklist.",
    preview: "admin",
    icon: "link",
    initialSelectedLeadId: "l0",
    autoSendEnrollmentLink: true,
  },
  {
    id: "parent-enrollment",
    title: "Parents complete enrollment",
    description:
      "Families complete the enrollment checklist and submit required forms.",
    preview: "parent",
    initialParentTab: "enrollment",
    icon: "clipboardCheck",
  },
  {
    id: "parent-pays-tuition",
    title: "Families manage tuition",
    description:
      "Families track enrollment steps and manage tuition payments from the parent portal.",
    preview: "parent",
    initialParentTab: "billing",
    icon: "creditCard",
  },
  {
    id: "teacher-attendance",
    title: "Educators take attendance",
    description:
      "Farm school educators log daily attendance for Monday Farm School and program rosters.",
    preview: "teacher",
    initialTeacherTab: "attendance",
    icon: "clipboardList",
  },
  createMobileAppWalkthroughStep(),
  {
    id: "get-in-touch",
    title: "Ready for next steps?",
    description:
      "Schedule a meeting, or email or call us to talk through this concept.",
    talkingPoint:
      "Pick a time on the calendar, or reach out directly — we'd love to walk through how this could work for Gathered Oak Farm.",
    preview: "contact",
    icon: "calendarDays",
  },
];

export const asheboroHybridAcademyWalkthroughPlaceholder: DemoWalkthroughStep[] = [
  {
    id: "discover",
    title: "Parents discover Asheboro Hybrid Academy",
    description:
      "Families find AHA online and explore Christian hybrid learning — campus days, home partnership, and programs for elementary, middle, and high school in Asheboro.",
    icon: "globe",
    scrollTarget: "top",
  },
  {
    id: "inquire",
    title: "Parents start an admissions conversation",
    description:
      "Parents submit the inquiry form to ask about enrollment, hybrid schedules, athletics, or tuition for the 2026–27 school year.",
    icon: "calendarDays",
    scrollTarget: "form",
  },
  {
    id: "view-lead",
    title: "View the inquiry in your admin",
    description:
      "The admissions inquiry appears in your admin dashboard for follow-up.",
    preview: "admin",
    initialAdmissionsTab: "submissions",
    animateNewSubmission: true,
    icon: "layoutDashboard",
  },
  {
    id: "send-application-link",
    title: "Start enrollment",
    description:
      "After the admissions conversation, accept the application and send the family their enrollment checklist.",
    preview: "admin",
    icon: "link",
    initialSelectedLeadId: "l0",
    autoSendEnrollmentLink: true,
  },
  {
    id: "parent-enrollment",
    title: "Parents complete enrollment",
    description:
      "Families complete the enrollment checklist and submit required forms.",
    preview: "parent",
    initialParentTab: "enrollment",
    icon: "clipboardCheck",
  },
  {
    id: "parent-pays-tuition",
    title: "Families manage tuition",
    description:
      "Families track enrollment steps and manage tuition payments from the parent portal.",
    preview: "parent",
    initialParentTab: "billing",
    icon: "creditCard",
  },
  {
    id: "teacher-attendance",
    title: "Teachers take attendance",
    description:
      "Educators log daily attendance for elementary, middle, and high school campus days.",
    preview: "teacher",
    initialTeacherTab: "attendance",
    icon: "clipboardList",
  },
  createMobileAppWalkthroughStep(),
  {
    id: "get-in-touch",
    title: "Ready for next steps?",
    description:
      "Schedule a meeting, or email or call us to talk through this concept.",
    talkingPoint:
      "Pick a time on the calendar, or reach out directly — we'd love to walk through how this could work for Asheboro Hybrid Academy.",
    preview: "contact",
    icon: "calendarDays",
  },
];

export const tapestryAcademyWalkthroughPlaceholder: DemoWalkthroughStep[] = [
  {
    id: "discover",
    title: "Parents discover Tapestry Academy",
    description:
      "Families find Tapestry online and explore flexible microschool and homeschool programs for Grades K–12 in East Boca Raton.",
    icon: "globe",
    scrollTarget: "top",
  },
  {
    id: "inquire",
    title: "Parents schedule a virtual call",
    description:
      "Parents submit the inquiry form to ask about microschool, Friday enrichment, or Homeschool Commons for the 2026–27 school year.",
    icon: "calendarDays",
    scrollTarget: "form",
  },
  {
    id: "view-lead",
    title: "View the inquiry in your admin",
    description:
      "The admissions inquiry appears in your admin dashboard for follow-up.",
    preview: "admin",
    initialAdmissionsTab: "submissions",
    animateNewSubmission: true,
    icon: "layoutDashboard",
  },
  {
    id: "send-application-link",
    title: "Start enrollment",
    description:
      "After the admissions conversation, accept the application and send the family their enrollment checklist.",
    preview: "admin",
    icon: "link",
    initialSelectedLeadId: "l0",
    autoSendEnrollmentLink: true,
  },
  {
    id: "parent-enrollment",
    title: "Parents complete enrollment",
    description:
      "Families complete the enrollment checklist and submit required forms.",
    preview: "parent",
    initialParentTab: "enrollment",
    icon: "clipboardCheck",
  },
  {
    id: "parent-pays-tuition",
    title: "Families manage tuition",
    description:
      "Families track enrollment steps and manage tuition payments from the parent portal.",
    preview: "parent",
    initialParentTab: "billing",
    icon: "creditCard",
  },
  {
    id: "teacher-attendance",
    title: "Teachers take attendance",
    description:
      "Educators log daily attendance for Foundations, Middle, and High School cohorts.",
    preview: "teacher",
    initialTeacherTab: "attendance",
    icon: "clipboardList",
  },
  createMobileAppWalkthroughStep(),
  {
    id: "get-in-touch",
    title: "Ready for next steps?",
    description:
      "Schedule a meeting, or email or call us to talk through this concept.",
    talkingPoint:
      "Pick a time on the calendar, or reach out directly — we'd love to walk through how this could work for Tapestry Academy.",
    preview: "contact",
    icon: "calendarDays",
  },
];

export const rootsAndWingsMicroschoolWalkthroughPlaceholder: DemoWalkthroughStep[] = [
  {
    id: "discover",
    title: "Parents discover your school",
    description:
      "Families find Roots and Wings Microschool online and explore personalized K–8 learning in North Mesa.",
    icon: "globe",
    scrollTarget: "top",
  },
  {
    id: "inquire",
    title: "Parents request a conversation",
    description:
      "Parents submit the inquiry form to ask about K–2 availability, schedule, ESA funding, or enrollment.",
    icon: "calendarDays",
    scrollTarget: "form",
  },
  {
    id: "view-lead",
    title: "View the lead in your admin",
    description: "The conversation request appears in your admin dashboard for follow-up.",
    preview: "admin",
    initialAdmissionsTab: "submissions",
    animateNewSubmission: true,
    icon: "layoutDashboard",
  },
  {
    id: "send-application-link",
    title: "Start enrollment",
    description:
      "After the conversation, accept the application and send the family their enrollment checklist.",
    preview: "admin",
    icon: "link",
    initialSelectedLeadId: "l0",
    autoSendEnrollmentLink: true,
  },
  {
    id: "parent-enrollment",
    title: "Parents complete enrollment",
    description: "Families complete the enrollment checklist and submit required forms.",
    preview: "parent",
    initialParentTab: "enrollment",
    icon: "clipboardCheck",
  },
  {
    id: "parent-pays-tuition",
    title: "Families manage tuition",
    description:
      "Families track enrollment steps and manage quarterly tuition payments from the parent portal.",
    preview: "parent",
    initialParentTab: "billing",
    icon: "creditCard",
  },
  {
    id: "teacher-attendance",
    title: "Teachers take attendance",
    description: "Julie logs daily attendance for K–2 and Grades 3–8 program rosters.",
    preview: "teacher",
    initialTeacherTab: "attendance",
    icon: "clipboardList",
  },
  createMobileAppWalkthroughStep(),
  {
    id: "get-in-touch",
    title: "Ready for next steps?",
    description: "Schedule a meeting, or email or call us to talk through this concept.",
    talkingPoint:
      "Pick a time on the calendar, or reach out directly — we'd love to walk through how this could work for Roots and Wings Microschool.",
    preview: "contact",
    icon: "calendarDays",
  },
];

export const freedomPrepAcademyWalkthroughPlaceholder: DemoWalkthroughStep[] = [
  {
    id: "discover",
    title: "Families discover Freedom Prep",
    description:
      "Arizona families find Freedom Prep online and explore flexible K–12 learning options—online, learning centers, and microschools.",
    icon: "globe",
    scrollTarget: "top",
  },
  {
    id: "inquire",
    title: "Parents submit an enrollment inquiry",
    description:
      "Families share their student's grade band and preferred learning pathway—online guided, independent, learning center, or microschool.",
    icon: "calendarDays",
    scrollTarget: "form",
  },
  {
    id: "view-lead",
    title: "View the lead in your admin",
    description:
      "The enrollment inquiry appears in your admin dashboard with pathway interest and grade band tags.",
    preview: "admin",
    initialAdmissionsTab: "submissions",
    animateNewSubmission: true,
    icon: "layoutDashboard",
  },
  {
    id: "send-application-link",
    title: "Start enrollment",
    description:
      "After the initial conversation, accept the application and send the family their enrollment checklist.",
    preview: "admin",
    icon: "link",
    initialSelectedLeadId: "l0",
    autoSendEnrollmentLink: true,
  },
  {
    id: "parent-enrollment",
    title: "Parents complete enrollment",
    description:
      "Families complete the enrollment checklist and submit required forms for their chosen pathway.",
    preview: "parent",
    initialParentTab: "enrollment",
    icon: "clipboardCheck",
  },
  {
    id: "parent-pays-tuition",
    title: "Families manage tuition",
    description:
      "Families track enrollment steps and manage payments from the parent portal.",
    preview: "parent",
    initialParentTab: "billing",
    icon: "creditCard",
  },
  {
    id: "teacher-attendance",
    title: "Guides take attendance",
    description:
      "Student support guides log daily attendance across online guided, learning center, and microschool rosters.",
    preview: "teacher",
    initialTeacherTab: "attendance",
    icon: "clipboardList",
  },
  createMobileAppWalkthroughStep(),
  {
    id: "get-in-touch",
    title: "Ready for next steps?",
    description: "Schedule a meeting, or email or call us to talk through this concept.",
    talkingPoint:
      "Pick a time on the calendar, or reach out directly — we'd love to walk through how this could work for Freedom Prep Academy.",
    preview: "contact",
    icon: "calendarDays",
  },
];

export const familyLyceumWalkthroughPlaceholder: DemoWalkthroughStep[] = [
  {
    id: "discover",
    title: "Parents discover your school",
    description:
      "Families find Family Lyceum online and explore hybrid private-school learning in Clearfield, Utah — from FIREFLY preschool through TORCH junior high.",
    icon: "globe",
    scrollTarget: "top",
  },
  {
    id: "inquire",
    title: "Parents schedule a conversation",
    description:
      "Parents submit the inquiry form to ask about FIREFLY preschool, hybrid schedules, tuition, or junior high enrollment.",
    icon: "calendarDays",
    scrollTarget: "form",
  },
  {
    id: "view-lead",
    title: "View the lead in your admin",
    description: "The conversation request appears in your admin dashboard for follow-up.",
    preview: "admin",
    initialAdmissionsTab: "submissions",
    animateNewSubmission: true,
    icon: "layoutDashboard",
  },
  {
    id: "send-application-link",
    title: "Start enrollment",
    description:
      "After the conversation, accept the application and send the family their enrollment checklist.",
    preview: "admin",
    icon: "link",
    initialSelectedLeadId: "l0",
    autoSendEnrollmentLink: true,
  },
  {
    id: "parent-enrollment",
    title: "Parents complete enrollment",
    description: "Families complete the enrollment checklist and submit required forms.",
    preview: "parent",
    initialParentTab: "enrollment",
    icon: "clipboardCheck",
  },
  {
    id: "parent-pays-tuition",
    title: "Families manage tuition",
    description:
      "Families track enrollment steps and manage hybrid tuition payments from the parent portal.",
    preview: "parent",
    initialParentTab: "billing",
    icon: "creditCard",
  },
  {
    id: "teacher-attendance",
    title: "Teachers take attendance",
    description:
      "Renae logs daily attendance for FIREFLY, elementary, and junior high program rosters.",
    preview: "teacher",
    initialTeacherTab: "attendance",
    icon: "clipboardList",
  },
  createMobileAppWalkthroughStep(),
  {
    id: "get-in-touch",
    title: "Ready for next steps?",
    description: "Schedule a meeting, or email or call us to talk through this concept.",
    talkingPoint:
      "Pick a time on the calendar, or reach out directly — we'd love to walk through how this could work for Family Lyceum.",
    preview: "contact",
    icon: "calendarDays",
  },
];

export const riverOakAcademyWalkthroughPlaceholder: DemoWalkthroughStep[] = [
  {
    id: "discover",
    title: "Parents discover your school",
    description:
      "Families find River Oak Academy online and explore learner-driven studios, outdoor learning, and the admissions journey in St. Johns.",
    icon: "globe",
    scrollTarget: "top",
  },
  {
    id: "inquire",
    title: "Parents schedule an introductory call",
    description:
      "Parents submit the inquiry form to start their admissions journey and schedule an introductory conversation.",
    icon: "calendarDays",
    scrollTarget: "form",
  },
  {
    id: "view-lead",
    title: "View the inquiry in your admin",
    description:
      "The introductory call inquiry appears in your admin dashboard for follow-up.",
    preview: "admin",
    initialAdmissionsTab: "submissions",
    animateNewSubmission: true,
    icon: "layoutDashboard",
  },
  {
    id: "send-application-link",
    title: "Start enrollment",
    description:
      "After the campus tour and trial period discussion, accept the application and send the family their enrollment checklist.",
    preview: "admin",
    icon: "link",
    initialSelectedLeadId: "l0",
    autoSendEnrollmentLink: true,
  },
  {
    id: "parent-enrollment",
    title: "Parents complete enrollment",
    description:
      "Families complete the enrollment checklist and submit required forms.",
    preview: "parent",
    initialParentTab: "enrollment",
    icon: "clipboardCheck",
  },
  {
    id: "parent-pays-tuition",
    title: "Families manage tuition",
    description:
      "Families track enrollment steps and manage tuition payments from the parent portal.",
    preview: "parent",
    initialParentTab: "billing",
    icon: "creditCard",
  },
  {
    id: "teacher-attendance",
    title: "Guides take attendance",
    description:
      "Studio guides log daily attendance for Spark, Elementary, and Middle School rosters.",
    preview: "teacher",
    initialTeacherTab: "attendance",
    icon: "clipboardList",
  },
  createMobileAppWalkthroughStep(),
  {
    id: "get-in-touch",
    title: "Ready for next steps?",
    description:
      "Schedule a meeting, or email or call us to talk through this concept.",
    talkingPoint:
      "Pick a time on the calendar, or reach out directly — we'd love to walk through how this could work for River Oak Academy.",
    preview: "contact",
    icon: "calendarDays",
  },
];

export const brazosValleyHonorAcademyWalkthroughPlaceholder: DemoWalkthroughStep[] = [
  {
    id: "discover",
    title: "Families discover BVHA",
    description:
      "Parents find Brazos Valley Honor Academy online and explore the Christian K–7 hybrid model in Navasota, Texas.",
    icon: "globe",
    scrollTarget: "top",
  },
  {
    id: "inquire",
    title: "Parents request a visit",
    description:
      "Families submit the visit request form to ask about the three-day hybrid model, tuition, or K–7 enrollment.",
    icon: "calendarDays",
    scrollTarget: "form",
  },
  {
    id: "view-lead",
    title: "View the lead in your admin",
    description: "The visit request appears in your admin dashboard for follow-up.",
    preview: "admin",
    initialAdmissionsTab: "submissions",
    animateNewSubmission: true,
    icon: "layoutDashboard",
  },
  {
    id: "send-application-link",
    title: "Start enrollment",
    description:
      "After the visit, accept the application and send the family their enrollment checklist.",
    preview: "admin",
    icon: "link",
    initialSelectedLeadId: "l0",
    autoSendEnrollmentLink: true,
  },
  {
    id: "parent-enrollment",
    title: "Parents complete enrollment",
    description: "Families complete the enrollment checklist and submit required forms.",
    preview: "parent",
    initialParentTab: "enrollment",
    icon: "clipboardCheck",
  },
  {
    id: "parent-pays-tuition",
    title: "Families manage tuition",
    description:
      "Families track enrollment steps and manage monthly tuition payments from the parent portal.",
    preview: "parent",
    initialParentTab: "billing",
    icon: "creditCard",
  },
  {
    id: "teacher-attendance",
    title: "Teachers take attendance",
    description: "Ms. Carter logs daily attendance for K–2 and Grades 3–7 program rosters.",
    preview: "teacher",
    initialTeacherTab: "attendance",
    icon: "clipboardList",
  },
  createMobileAppWalkthroughStep(),
  {
    id: "get-in-touch",
    title: "Ready for next steps?",
    description: "Schedule a meeting, or email or call us to talk through this concept.",
    talkingPoint:
      "Pick a time on the calendar, or reach out directly — we'd love to walk through how this could work for Brazos Valley Honor Academy.",
    preview: "contact",
    icon: "calendarDays",
  },
];

export const inspiredLearningWalkthroughPlaceholder: DemoWalkthroughStep[] = [
  {
    id: "discover",
    title: "Parents discover your school",
    description:
      "Families in Allen find Inspired online and explore the grades 6–12 hybrid week, mentorship, and whether it is a fit.",
    icon: "globe",
    scrollTarget: "top",
  },
  {
    id: "inquire",
    title: "Parents schedule a tour",
    description:
      "Parents use the preview form to ask about a fit-check tour or a 15-minute call. Nothing is sent to the school.",
    icon: "calendarDays",
    scrollTarget: "form",
  },
  {
    id: "view-lead",
    title: "View the lead in your admin",
    description:
      "The tour inquiry appears in admin, including middle school interest and the high school waiting list.",
    preview: "admin",
    initialAdmissionsTab: "submissions",
    animateNewSubmission: true,
    icon: "layoutDashboard",
  },
  {
    id: "send-application-link",
    title: "Start enrollment",
    description:
      "After a fit-check conversation, accept the application and send the family their enrollment checklist.",
    preview: "admin",
    icon: "link",
    initialSelectedLeadId: "l0",
    autoSendEnrollmentLink: true,
  },
  {
    id: "parent-enrollment",
    title: "Parents complete enrollment",
    description: "Families complete the enrollment checklist and submit required forms.",
    preview: "parent",
    initialParentTab: "enrollment",
    icon: "clipboardCheck",
  },
  {
    id: "parent-pays-tuition",
    title: "Parent pays tuition",
    description:
      "Families pay tuition and manage invoices from the parent portal. Published tuition is $12,970 a year.",
    preview: "parent",
    initialParentTab: "billing",
    icon: "creditCard",
  },
  {
    id: "teacher-attendance",
    title: "Teachers take attendance",
    description:
      "Facilitators log attendance for middle school, high school, passion projects, and mentoring.",
    preview: "teacher",
    initialTeacherTab: "attendance",
    icon: "clipboardList",
  },
  createMobileAppWalkthroughStep(),
  {
    id: "get-in-touch",
    title: "Ready for next steps?",
    description: "Schedule a meeting, or email or call us to talk through this concept.",
    talkingPoint:
      "Pick a time on the calendar, or reach out directly — we'd love to walk through how this could work for Inspired Learning Academy.",
    preview: "contact",
    icon: "calendarDays",
  },
];

export const wildcatMicroschoolWalkthroughPlaceholder: DemoWalkthroughStep[] = [
  {
    id: "discover",
    title: "Parents discover your school",
    description:
      "Families find Wildcat Microschool online and read about the homeschool learning pod in Haverhill, New Hampshire.",
    icon: "globe",
    scrollTarget: "top",
  },
  {
    id: "inquire",
    title: "Parents ask a question",
    description:
      "Parents use the preview form for a general question or a waitlist question. Nothing is sent to the school.",
    icon: "calendarDays",
    scrollTarget: "form",
  },
  {
    id: "view-lead",
    title: "View the lead in your admin",
    description:
      "The sample inquiry appears in admin. It does not confirm an opening or a published age range.",
    preview: "admin",
    initialAdmissionsTab: "submissions",
    animateNewSubmission: true,
    icon: "layoutDashboard",
  },
  {
    id: "send-application-link",
    title: "Start enrollment",
    description:
      "After a conversation, accept the application and send the family their enrollment checklist.",
    preview: "admin",
    icon: "link",
    initialSelectedLeadId: "l0",
    autoSendEnrollmentLink: true,
  },
  {
    id: "parent-enrollment",
    title: "Parents complete enrollment",
    description: "Families complete the enrollment checklist and submit required forms.",
    preview: "parent",
    initialParentTab: "enrollment",
    icon: "clipboardCheck",
  },
  {
    id: "parent-pays-tuition",
    title: "Parent pays tuition",
    description:
      "Families pay and manage invoices from the parent portal in this product preview. Wildcat has not published a tuition amount.",
    preview: "parent",
    initialParentTab: "billing",
    icon: "creditCard",
  },
  {
    id: "teacher-attendance",
    title: "Teachers take attendance",
    description:
      "Guides log attendance across student-driven learning, hands-on projects, nature-based learning, and collaborative learning.",
    preview: "teacher",
    initialTeacherTab: "attendance",
    icon: "clipboardList",
  },
  createMobileAppWalkthroughStep(),
  {
    id: "get-in-touch",
    title: "Ready for next steps?",
    description: "Schedule a meeting, or email or call us to talk through this concept.",
    talkingPoint:
      "Pick a time on the calendar, or reach out directly — we'd love to walk through how this could work for Wildcat Microschool.",
    preview: "contact",
    icon: "calendarDays",
  },
];
