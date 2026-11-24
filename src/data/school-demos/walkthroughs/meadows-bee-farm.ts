import { createMobileAppWalkthroughStep, type DemoWalkthroughStep } from "./shared";

export const meadowsBeeFarmWalkthroughPlaceholder: DemoWalkthroughStep[] = [
  {
    id: "discover",
    title: "Families discover the farm",
    description:
      "Families find Meadows Bee Farm online and see every program, the badges and what a Wednesday on the farm costs.",
    icon: "globe",
    scrollTarget: "top",
  },
  {
    id: "inquire",
    title: "Families sign up",
    description: "Parents sign up a Young Farmer for Wednesdays or a family day, or ask about a scholarship.",
    icon: "calendarDays",
    scrollTarget: "form",
  },
  {
    id: "view-lead",
    title: "View it in your admin",
    description: "Every sign-up lands in one admin inbox with the child's age, program and any food needs.",
    preview: "admin",
    initialAdmissionsTab: "submissions",
    animateNewSubmission: true,
    icon: "layoutDashboard",
  },
  {
    id: "send-application-link",
    title: "Start enrollment",
    description: "Accept the sign-up and send the family a checklist: release form, allergies and pickup, once for the year.",
    preview: "admin",
    icon: "link",
    initialSelectedLeadId: "l0",
    autoSendEnrollmentLink: true,
  },
  {
    id: "parent-enrollment",
    title: "Parents complete the checklist",
    description: "Families sign the farm release and add allergies and pickup contacts in one place.",
    preview: "parent",
    initialParentTab: "enrollment",
    icon: "clipboardCheck",
  },
  {
    id: "parent-pays-tuition",
    title: "Parents pay for sessions",
    description: "Families pay for each month's Wednesdays from one billing page, with scholarships applied.",
    preview: "parent",
    initialParentTab: "billing",
    icon: "creditCard",
  },
  {
    id: "teacher-attendance",
    title: "Staff take attendance",
    description: "Farm staff check in Young Farmers each Wednesday and family day.",
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
      "Pick a time on the calendar, or reach out directly — we'd love to walk through how this could work for Meadows Bee Farm.",
    preview: "contact",
    icon: "calendarDays",
  },
];
