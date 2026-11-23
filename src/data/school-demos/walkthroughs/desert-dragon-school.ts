import { createMobileAppWalkthroughStep, type DemoWalkthroughStep } from "./shared";

export const desertDragonSchoolWalkthroughPlaceholder: DemoWalkthroughStep[] = [
  {
    id: "discover",
    title: "Parents discover your school",
    description:
      "Tucson families find Desert Dragon online and see full-time and part-time tuition, ESA and STO options, right on the page.",
    icon: "globe",
    scrollTarget: "top",
  },
  {
    id: "inquire",
    title: "Parents request a tour",
    description: "Families request a tour from one form instead of writing an email.",
    icon: "calendarDays",
    scrollTarget: "form",
  },
  {
    id: "view-lead",
    title: "View the request in your admin",
    description: "The request lands in one admin inbox with the student's grade, plan and ESA status.",
    preview: "admin",
    initialAdmissionsTab: "submissions",
    animateNewSubmission: true,
    icon: "layoutDashboard",
  },
  {
    id: "send-application-link",
    title: "Start enrollment",
    description: "After the tour, send the family the enrollment checklist.",
    preview: "admin",
    icon: "link",
    initialSelectedLeadId: "l0",
    autoSendEnrollmentLink: true,
  },
  {
    id: "parent-enrollment",
    title: "Parents complete enrollment",
    description: "Families pick their days, sign the enrollment agreement and pay the $200 materials fee in one checklist.",
    preview: "parent",
    initialParentTab: "enrollment",
    icon: "clipboardCheck",
  },
  {
    id: "parent-pays-tuition",
    title: "Parent pays tuition",
    description: "Families pick yearly, quarterly or monthly payments and set up autopay by card or bank.",
    preview: "parent",
    initialParentTab: "billing",
    icon: "creditCard",
  },
  {
    id: "teacher-attendance",
    title: "Teachers take attendance",
    description: "Learning coaches take roll, including part-time students on their chosen days.",
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
      "Pick a time on the calendar, or reach out directly — we'd love to walk through how this could work for Desert Dragon.",
    preview: "contact",
    icon: "calendarDays",
  },
];
