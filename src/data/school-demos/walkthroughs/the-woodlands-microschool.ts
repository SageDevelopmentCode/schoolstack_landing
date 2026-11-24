import { createMobileAppWalkthroughStep, type DemoWalkthroughStep } from "./shared";

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
  createMobileAppWalkthroughStep(),
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
