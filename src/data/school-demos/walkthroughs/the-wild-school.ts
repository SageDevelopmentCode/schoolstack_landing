import { createMobileAppWalkthroughStep, type DemoWalkthroughStep } from "./shared";

export const theWildSchoolWalkthroughPlaceholder: DemoWalkthroughStep[] = [
  {
    id: "discover",
    title: "Parents discover your school",
    description:
      "Houston families find The Wild School online and see every program, location and price in one place.",
    icon: "globe",
    scrollTarget: "top",
  },
  {
    id: "inquire",
    title: "Parents apply",
    description: "Families pick a program and their nearest location from one form, with the application fee taken online.",
    icon: "calendarDays",
    scrollTarget: "form",
  },
  {
    id: "view-lead",
    title: "View the application in your admin",
    description: "Every application lands in one admin inbox, tagged by location and program, ready for play dates.",
    preview: "admin",
    initialAdmissionsTab: "submissions",
    animateNewSubmission: true,
    icon: "layoutDashboard",
  },
  {
    id: "send-application-link",
    title: "Start enrollment",
    description: "After the play date, accept the family and send their registration checklist.",
    preview: "admin",
    icon: "link",
    initialSelectedLeadId: "l0",
    autoSendEnrollmentLink: true,
  },
  {
    id: "parent-enrollment",
    title: "Parents complete enrollment",
    description: "Families sign the handbook acknowledgment and pay the registration and supply fee in one checklist.",
    preview: "parent",
    initialParentTab: "enrollment",
    icon: "clipboardCheck",
  },
  {
    id: "parent-pays-tuition",
    title: "Parent pays tuition",
    description: "Families choose their days and a payment plan, set up autopay and see every invoice.",
    preview: "parent",
    initialParentTab: "billing",
    icon: "creditCard",
  },
  {
    id: "teacher-attendance",
    title: "Teachers take attendance",
    description: "Lead teachers take roll at each location every morning.",
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
      "Pick a time on the calendar, or reach out directly — we'd love to walk through how this could work for The Wild School.",
    preview: "contact",
    icon: "calendarDays",
  },
];
