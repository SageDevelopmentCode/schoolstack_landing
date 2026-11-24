import { createMobileAppWalkthroughStep, type DemoWalkthroughStep } from "./shared";

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
  createMobileAppWalkthroughStep(),
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
