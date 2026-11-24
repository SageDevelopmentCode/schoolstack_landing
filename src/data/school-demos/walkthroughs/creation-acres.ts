import { createMobileAppWalkthroughStep, type DemoWalkthroughStep } from "./shared";

export const creationAcresWalkthroughPlaceholder: DemoWalkthroughStep[] = [
  {
    id: "discover",
    title: "Parents discover Creation Acres",
    description:
      "Families find you online and explore your Christ-centered Montessori programs.",
    icon: "globe",
    scrollTarget: "top",
  },
  {
    id: "discovery-call",
    title: "Parents request information",
    description: "Parents submit the inquiry form to schedule a tour or ask questions.",
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
      "After the tour or interview, accept the application and send the family their enrollment checklist.",
    preview: "admin",
    icon: "link",
    initialSelectedLeadId: "l0",
    autoSendEnrollmentLink: true,
  },
  {
    id: "parent-enrollment",
    title: "Parents go through the enrollment",
    description: "Families complete the enrollment checklist from their parent portal.",
    preview: "parent",
    initialParentTab: "enrollment",
    icon: "clipboardCheck",
  },
  {
    id: "parent-pays-tuition",
    title: "Parent pays tuition",
    description:
      "Families pay tuition and manage invoices from the parent portal.",
    preview: "parent",
    initialParentTab: "billing",
    icon: "creditCard",
  },
  {
    id: "teacher-attendance",
    title: "Guides take attendance",
    description: "Montessori guides track daily attendance from the teacher portal.",
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
      "Pick a time on the calendar, or reach out directly — we'd love to walk through how this could work for Creation Acres Montessori.",
    preview: "contact",
    icon: "calendarDays",
  },
];
