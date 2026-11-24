import { createMobileAppWalkthroughStep, type DemoWalkthroughStep } from "./shared";

export const freedomPrepAcademyWalkthroughPlaceholder: DemoWalkthroughStep[] = [
  {
    id: "discover",
    title: "Families discover Freedom Prep",
    description:
      "Arizona families find Freedom Prep online and explore flexible K–12 learning options—online, learning centers, and microschools.",
    icon: "globe",
    scrollTarget: "top",
  },
  {
    id: "inquire",
    title: "Parents submit an enrollment inquiry",
    description:
      "Families share their student's grade band and preferred learning pathway—online guided, independent, learning center, or microschool.",
    icon: "calendarDays",
    scrollTarget: "form",
  },
  {
    id: "view-lead",
    title: "View the lead in your admin",
    description:
      "The enrollment inquiry appears in your admin dashboard with pathway interest and grade band tags.",
    preview: "admin",
    initialAdmissionsTab: "submissions",
    animateNewSubmission: true,
    icon: "layoutDashboard",
  },
  {
    id: "send-application-link",
    title: "Start enrollment",
    description:
      "After the initial conversation, accept the application and send the family their enrollment checklist.",
    preview: "admin",
    icon: "link",
    initialSelectedLeadId: "l0",
    autoSendEnrollmentLink: true,
  },
  {
    id: "parent-enrollment",
    title: "Parents complete enrollment",
    description:
      "Families complete the enrollment checklist and submit required forms for their chosen pathway.",
    preview: "parent",
    initialParentTab: "enrollment",
    icon: "clipboardCheck",
  },
  {
    id: "parent-pays-tuition",
    title: "Families manage tuition",
    description:
      "Families track enrollment steps and manage payments from the parent portal.",
    preview: "parent",
    initialParentTab: "billing",
    icon: "creditCard",
  },
  {
    id: "teacher-attendance",
    title: "Guides take attendance",
    description:
      "Student support guides log daily attendance across online guided, learning center, and microschool rosters.",
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
      "Pick a time on the calendar, or reach out directly — we'd love to walk through how this could work for Freedom Prep Academy.",
    preview: "contact",
    icon: "calendarDays",
  },
];
