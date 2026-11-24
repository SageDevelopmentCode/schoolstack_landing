/**
 * Walkthrough step types and the steps every demo shares. Each school's steps live in
 * their own file here so a demo page only ships its own walkthrough.
 */

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

/** The MudKitchen app screenshots step. Every walkthrough has it, just before contact. */
export function createMobileAppWalkthroughStep(): DemoWalkthroughStep {
  return {
    id: "mobile-app",
    title: "Everything in your pocket",
    description:
      "Families, teachers, and admins get the MudKitchen app: messaging, tuition, enrollment, attendance, and admissions in one place.",
    talkingPoint:
      "Parents pay tuition and message teachers, teachers take attendance from the classroom floor, and admins review admissions — all from their phones.",
    preview: "mobile",
    previewHint: "The MudKitchen app — on the App Store now, Google Play soon.",
    previewHintDelayMs: 800,
    icon: "smartphone",
  };
}
