import { createMobileAppWalkthroughStep, type DemoWalkthroughStep } from "./shared";

export const downToEarthHomeschoolWalkthroughPlaceholder: DemoWalkthroughStep[] = [
  {
    id: "discover",
    title: "Parents discover your co-op",
    description:
      "Homeschooling families find Down to Earth online and see the Monday program, the Friday park days and this year's tuition.",
    icon: "globe",
    scrollTarget: "top",
  },
  {
    id: "inquire",
    title: "Parents apply for membership",
    description: "Families send a membership application from any page, with each child's grade group.",
    icon: "calendarDays",
    scrollTarget: "form",
  },
  {
    id: "view-lead",
    title: "View the application in your admin",
    description: "The application lands in one admin inbox, ready to set up a park interview.",
    preview: "admin",
    initialAdmissionsTab: "submissions",
    animateNewSubmission: true,
    icon: "layoutDashboard",
  },
  {
    id: "send-application-link",
    title: "Start enrollment",
    description: "After the interview, accept the family and send their enrollment checklist.",
    preview: "admin",
    icon: "link",
    initialSelectedLeadId: "l0",
    autoSendEnrollmentLink: true,
  },
  {
    id: "parent-enrollment",
    title: "Parents complete enrollment",
    description: "Families sign the waiver, photo release and program policies and pay the enrollment fee in one checklist.",
    preview: "parent",
    initialParentTab: "enrollment",
    icon: "clipboardCheck",
  },
  {
    id: "parent-pays-tuition",
    title: "Parent pays tuition",
    description: "Families see the August and November installments, pay online and keep every invoice.",
    preview: "parent",
    initialParentTab: "billing",
    icon: "creditCard",
  },
  {
    id: "teacher-attendance",
    title: "Instructors take attendance",
    description: "Instructors take roll for K–2nd, 3rd–5th and middle school each Monday.",
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
      "Pick a time on the calendar, or reach out directly — we'd love to walk through how this could work for Down to Earth Co-op.",
    preview: "contact",
    icon: "calendarDays",
  },
];
