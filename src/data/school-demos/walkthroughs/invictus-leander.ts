import { createMobileAppWalkthroughStep, type DemoWalkthroughStep } from "./shared";

export const invictusLeanderWalkthroughPlaceholder: DemoWalkthroughStep[] = [
  {
    id: "discover",
    title: "Parents discover your school",
    description:
      "Families find Invictus online, see the Spark and Discovery Studios and how TEFA offsets tuition.",
    icon: "globe",
    scrollTarget: "top",
  },
  {
    id: "inquire",
    title: "Parents send an audition form",
    description: "Families complete the audition form from any page, and can save it and come back.",
    icon: "calendarDays",
    scrollTarget: "form",
  },
  {
    id: "view-lead",
    title: "View the audition in your admin",
    description: "Each audition lands in one admin inbox with the learner's age, studio and TEFA status, ready for a Family Meet-Up.",
    preview: "admin",
    initialAdmissionsTab: "submissions",
    animateNewSubmission: true,
    icon: "layoutDashboard",
  },
  {
    id: "send-application-link",
    title: "Start enrollment",
    description: "After the Family Meet-Up, invite the learner to enroll and send the family their enrollment checklist.",
    preview: "admin",
    icon: "link",
    initialSelectedLeadId: "l0",
    autoSendEnrollmentLink: true,
  },
  {
    id: "parent-enrollment",
    title: "Parents complete enrollment",
    description: "Families sign the enrollment contract and pay the $1,335 enrollment fee in one checklist.",
    preview: "parent",
    initialParentTab: "enrollment",
    icon: "clipboardCheck",
  },
  {
    id: "parent-pays-tuition",
    title: "Parent pays tuition",
    description: "Families see their 11 monthly payments, set up autopay and keep every invoice in the parent portal.",
    preview: "parent",
    initialParentTab: "billing",
    icon: "creditCard",
  },
  {
    id: "teacher-attendance",
    title: "Guides take attendance",
    description: "Guides take roll for the Spark and Discovery Studios.",
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
      "Pick a time on the calendar, or reach out directly — we'd love to walk through how this could work for Invictus.",
    preview: "contact",
    icon: "calendarDays",
  },
];
