import { createMobileAppWalkthroughStep, type DemoWalkthroughStep } from "./shared";

export const renewedRootsForestSchoolWalkthroughPlaceholder: DemoWalkthroughStep[] = [
  {
    id: "discover",
    title: "Parents discover your school",
    description:
      "Fargo-Moorhead families find Renewed Roots online and see the programs, the campus and tuition in one place.",
    icon: "globe",
    scrollTarget: "top",
  },
  {
    id: "inquire",
    title: "Parents send an inquiry",
    description: "Families pick Wanderers, Trailblazers, Stewards or camp from one form on any page.",
    icon: "calendarDays",
    scrollTarget: "form",
  },
  {
    id: "view-lead",
    title: "View the inquiry in your admin",
    description: "The inquiry lands in one admin inbox with the child's age and program, ready for a director call.",
    preview: "admin",
    initialAdmissionsTab: "submissions",
    animateNewSubmission: true,
    icon: "layoutDashboard",
  },
  {
    id: "send-application-link",
    title: "Start enrollment",
    description: "After the director call, approve the family and send their enrollment checklist.",
    preview: "admin",
    icon: "link",
    initialSelectedLeadId: "l0",
    autoSendEnrollmentLink: true,
  },
  {
    id: "parent-enrollment",
    title: "Parents complete enrollment",
    description: "Families sign the registration form and pay the deposit online in one checklist.",
    preview: "parent",
    initialParentTab: "enrollment",
    icon: "clipboardCheck",
  },
  {
    id: "parent-pays-tuition",
    title: "Parent pays tuition",
    description: "Families choose yearly, weekly or part-time, pay bi-weekly by card or bank, and see every invoice.",
    preview: "parent",
    initialParentTab: "billing",
    icon: "creditCard",
  },
  {
    id: "teacher-attendance",
    title: "Teachers take attendance",
    description: "Teachers take roll for Wanderers, Trailblazers and Stewards each morning.",
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
      "Pick a time on the calendar, or reach out directly — we'd love to walk through how this could work for Renewed Roots.",
    preview: "contact",
    icon: "calendarDays",
  },
];
