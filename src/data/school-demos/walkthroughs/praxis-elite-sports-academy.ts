import { createMobileAppWalkthroughStep, type DemoWalkthroughStep } from "./shared";

export const praxisEliteSportsAcademyWalkthroughPlaceholder: DemoWalkthroughStep[] = [
  {
    id: "discover",
    title: "Parents discover your school",
    description:
      "San Diego families find Praxis Elite online and see the 5 Day, 3 Day and Flex programs and prices right on the page.",
    icon: "globe",
    scrollTarget: "top",
  },
  {
    id: "inquire",
    title: "Parents book a Shadow Day",
    description: "Families request a Shadow Day from one form instead of emailing the Director.",
    icon: "calendarDays",
    scrollTarget: "form",
  },
  {
    id: "view-lead",
    title: "View the request in your admin",
    description: "The request lands in one admin inbox with the student's grade, sport and program.",
    preview: "admin",
    initialAdmissionsTab: "submissions",
    animateNewSubmission: true,
    icon: "layoutDashboard",
  },
  {
    id: "send-application-link",
    title: "Start enrollment",
    description: "After the Shadow Day, essay and recommendation, accept the athlete and send the enrollment checklist.",
    preview: "admin",
    icon: "link",
    initialSelectedLeadId: "l0",
    autoSendEnrollmentLink: true,
  },
  {
    id: "parent-enrollment",
    title: "Parents complete enrollment",
    description: "Families sign the enrollment agreement, add medical and injury notes, and pay the $1,000 deposit in one checklist.",
    preview: "parent",
    initialParentTab: "enrollment",
    icon: "clipboardCheck",
  },
  {
    id: "parent-pays-tuition",
    title: "Parent pays tuition",
    description: "Families see tuition and any curriculum upgrades on one bill, and pay by card or bank.",
    preview: "parent",
    initialParentTab: "billing",
    icon: "creditCard",
  },
  {
    id: "teacher-attendance",
    title: "Teachers take attendance",
    description: "Coaches and teachers take roll for academic and athletic periods.",
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
      "Pick a time on the calendar, or reach out directly — we'd love to walk through how this could work for Praxis Elite.",
    preview: "contact",
    icon: "calendarDays",
  },
];
