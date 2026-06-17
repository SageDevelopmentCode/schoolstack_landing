export type DemoWalkthroughIcon =
  | "globe"
  | "calendarDays"
  | "layoutDashboard"
  | "gitBranch"
  | "link"
  | "clipboardCheck"
  | "creditCard"
  | "clipboardList"
  | "messageCircle";

export type DemoWalkthroughAdmissionsTab = "flows" | "submissions";

export type DemoWalkthroughParentTab = "enrollment" | "home" | "billing";

export type DemoWalkthroughTeacherTab =
  | "dashboard"
  | "students"
  | "hours"
  | "messages"
  | "calendar"
  | "feed"
  | "attendance"
  | "payroll"
  | "forms";

export type DemoWalkthroughPreview =
  | "website"
  | "admin"
  | "parent"
  | "teacher"
  | "contact";

export interface DemoWalkthroughStepTheme {
  bg: string;
  bgHover: string;
  bgActive: string;
  border: string;
  iconBg: string;
  iconColor: string;
  titleColor: string;
  descColor: string;
  connector: string;
}

export interface DemoWalkthroughStep {
  id: string;
  title: string;
  description: string;
  talkingPoint?: string;
  preview?: DemoWalkthroughPreview;
  scrollTarget?: "top" | "form";
  initialAdmissionsTab?: DemoWalkthroughAdmissionsTab;
  initialSelectedLeadId?: string;
  initialSelectedFlowId?: string;
  initialParentTab?: DemoWalkthroughParentTab;
  initialTeacherTab?: DemoWalkthroughTeacherTab;
  animateNewSubmission?: boolean;
  autoSendEnrollmentLink?: boolean;
  icon: DemoWalkthroughIcon;
  theme: DemoWalkthroughStepTheme;
}

export const athenaWalkthroughPlaceholder: DemoWalkthroughStep[] = [
  {
    id: "discover",
    title: "Parents discover your school",
    description: "Families find you online and explore your programs.",
    icon: "globe",
    scrollTarget: "top",
    theme: {
      bg: "#EEF4F8",
      bgHover: "#E4EDF4",
      bgActive: "#E4EDF4",
      border: "#C5D9E8",
      iconBg: "#173B5C",
      iconColor: "#FFFFFF",
      titleColor: "#173B5C",
      descColor: "#4A6578",
      connector: "#173B5C",
    },
  },
  {
    id: "discovery-call",
    title: "Parents schedule a discovery call",
    description: "Parents submit the inquiry form to book a call.",
    icon: "calendarDays",
    scrollTarget: "form",
    theme: {
      bg: "#F2E7D1",
      bgHover: "#EBDFC4",
      bgActive: "#EBDFC4",
      border: "#D9C9A3",
      iconBg: "#C1A367",
      iconColor: "#FFFFFF",
      titleColor: "#5C4A2A",
      descColor: "#7A6848",
      connector: "#C1A367",
    },
  },
  {
    id: "view-lead",
    title: "View the lead in your admin",
    description: "The inquiry appears in your admin dashboard so you can follow up.",
    preview: "admin",
    initialAdmissionsTab: "submissions",
    animateNewSubmission: true,
    icon: "layoutDashboard",
    theme: {
      bg: "#EEF4F8",
      bgHover: "#E4EDF4",
      bgActive: "#E4EDF4",
      border: "#C5D9E8",
      iconBg: "#173B5C",
      iconColor: "#FFFFFF",
      titleColor: "#173B5C",
      descColor: "#4A6578",
      connector: "#173B5C",
    },
  },
  {
    id: "send-application-link",
    title: "Send enrollment link",
    description: "After the discovery call, you can send the enrollment link.",
    preview: "admin",
    icon: "link",
    initialSelectedLeadId: "l0",
    autoSendEnrollmentLink: true,
    theme: {
      bg: "#F2E7D1",
      bgHover: "#EBDFC4",
      bgActive: "#EBDFC4",
      border: "#D9C9A3",
      iconBg: "#C1A367",
      iconColor: "#FFFFFF",
      titleColor: "#5C4A2A",
      descColor: "#7A6848",
      connector: "#C1A367",
    },
  },
  {
    id: "parent-enrollment",
    title: "Parents go through the enrollment",
    description: "Families complete the enrollment checklist from their parent portal.",
    preview: "parent",
    initialParentTab: "enrollment",
    icon: "clipboardCheck",
    theme: {
      bg: "#EEF4F8",
      bgHover: "#E4EDF4",
      bgActive: "#E4EDF4",
      border: "#C5D9E8",
      iconBg: "#173B5C",
      iconColor: "#FFFFFF",
      titleColor: "#173B5C",
      descColor: "#4A6578",
      connector: "#173B5C",
    },
  },
  {
    id: "parent-pays-tuition",
    title: "Parent pays tuition",
    description:
      "Families pay tuition and manage invoices from the parent portal.",
    preview: "parent",
    initialParentTab: "billing",
    icon: "creditCard",
    theme: {
      bg: "#F2E7D1",
      bgHover: "#EBDFC4",
      bgActive: "#EBDFC4",
      border: "#D9C9A3",
      iconBg: "#C1A367",
      iconColor: "#FFFFFF",
      titleColor: "#5C4A2A",
      descColor: "#7A6848",
      connector: "#C1A367",
    },
  },
  {
    id: "teacher-attendance",
    title: "Teachers take attendance",
    description: "Staff track daily attendance from the teacher portal.",
    preview: "teacher",
    initialTeacherTab: "attendance",
    icon: "clipboardList",
    theme: {
      bg: "#EEF4F8",
      bgHover: "#E4EDF4",
      bgActive: "#E4EDF4",
      border: "#C5D9E8",
      iconBg: "#173B5C",
      iconColor: "#FFFFFF",
      titleColor: "#173B5C",
      descColor: "#4A6578",
      connector: "#173B5C",
    },
  },
  {
    id: "get-in-touch",
    title: "Questions? Let's connect",
    description: "Share feedback or ask about anything you saw in this concept.",
    talkingPoint:
      "We'd love to hear what resonated — or what you'd want to change.",
    preview: "contact",
    icon: "messageCircle",
    theme: {
      bg: "#F2E7D1",
      bgHover: "#EBDFC4",
      bgActive: "#EBDFC4",
      border: "#D9C9A3",
      iconBg: "#C1A367",
      iconColor: "#FFFFFF",
      titleColor: "#5C4A2A",
      descColor: "#7A6848",
      connector: "#C1A367",
    },
  },
];

export const wonderhereWalkthroughPlaceholder: DemoWalkthroughStep[] = [
  {
    id: "discover",
    title: "Parents discover your school",
    description: "Families find you online and explore your Lakeland programs.",
    icon: "globe",
    scrollTarget: "top",
    theme: {
      bg: "#EDF4EA",
      bgHover: "#E4EDE4",
      bgActive: "#E4EDE4",
      border: "#C5D9C8",
      iconBg: "#3D5A45",
      iconColor: "#FFFFFF",
      titleColor: "#3D5A45",
      descColor: "#5A6F5C",
      connector: "#3D5A45",
    },
  },
  {
    id: "schedule-visit",
    title: "Parents schedule a visit",
    description: "Parents submit the inquiry form to request info or book a visit.",
    icon: "calendarDays",
    scrollTarget: "form",
    theme: {
      bg: "#F5F1E8",
      bgHover: "#EBE5D8",
      bgActive: "#EBE5D8",
      border: "#D9CFC0",
      iconBg: "#C4A574",
      iconColor: "#FFFFFF",
      titleColor: "#5C4A2A",
      descColor: "#7A6848",
      connector: "#C4A574",
    },
  },
  {
    id: "view-lead",
    title: "View the lead in your admin",
    description: "The inquiry appears in your admin dashboard so you can follow up.",
    preview: "admin",
    initialAdmissionsTab: "submissions",
    animateNewSubmission: true,
    icon: "layoutDashboard",
    theme: {
      bg: "#EDF4EA",
      bgHover: "#E4EDE4",
      bgActive: "#E4EDE4",
      border: "#C5D9C8",
      iconBg: "#3D5A45",
      iconColor: "#FFFFFF",
      titleColor: "#3D5A45",
      descColor: "#5A6F5C",
      connector: "#3D5A45",
    },
  },
  {
    id: "send-application-link",
    title: "Send enrollment link",
    description: "After the visit, you can send the enrollment link.",
    preview: "admin",
    icon: "link",
    initialSelectedLeadId: "l0",
    autoSendEnrollmentLink: true,
    theme: {
      bg: "#F5F1E8",
      bgHover: "#EBE5D8",
      bgActive: "#EBE5D8",
      border: "#D9CFC0",
      iconBg: "#C4A574",
      iconColor: "#FFFFFF",
      titleColor: "#5C4A2A",
      descColor: "#7A6848",
      connector: "#C4A574",
    },
  },
  {
    id: "parent-enrollment",
    title: "Parents go through the enrollment",
    description: "Families complete the enrollment checklist from their parent portal.",
    preview: "parent",
    initialParentTab: "enrollment",
    icon: "clipboardCheck",
    theme: {
      bg: "#EDF4EA",
      bgHover: "#E4EDE4",
      bgActive: "#E4EDE4",
      border: "#C5D9C8",
      iconBg: "#3D5A45",
      iconColor: "#FFFFFF",
      titleColor: "#3D5A45",
      descColor: "#5A6F5C",
      connector: "#3D5A45",
    },
  },
  {
    id: "parent-pays-tuition",
    title: "Parent pays tuition",
    description:
      "Families pay tuition and manage invoices from the parent portal.",
    preview: "parent",
    initialParentTab: "billing",
    icon: "creditCard",
    theme: {
      bg: "#F5F1E8",
      bgHover: "#EBE5D8",
      bgActive: "#EBE5D8",
      border: "#D9CFC0",
      iconBg: "#C4A574",
      iconColor: "#FFFFFF",
      titleColor: "#5C4A2A",
      descColor: "#7A6848",
      connector: "#C4A574",
    },
  },
  {
    id: "teacher-attendance",
    title: "Teachers take attendance",
    description: "Staff track daily attendance from the teacher portal.",
    preview: "teacher",
    initialTeacherTab: "attendance",
    icon: "clipboardList",
    theme: {
      bg: "#EDF4EA",
      bgHover: "#E4EDE4",
      bgActive: "#E4EDE4",
      border: "#C5D9C8",
      iconBg: "#3D5A45",
      iconColor: "#FFFFFF",
      titleColor: "#3D5A45",
      descColor: "#5A6F5C",
      connector: "#3D5A45",
    },
  },
  {
    id: "get-in-touch",
    title: "Questions? Let's connect",
    description: "Share feedback or ask about anything you saw in this concept.",
    talkingPoint:
      "We'd love to hear what resonated — or what you'd want to change.",
    preview: "contact",
    icon: "messageCircle",
    theme: {
      bg: "#F5F1E8",
      bgHover: "#EBE5D8",
      bgActive: "#EBE5D8",
      border: "#D9CFC0",
      iconBg: "#C4A574",
      iconColor: "#FFFFFF",
      titleColor: "#5C4A2A",
      descColor: "#7A6848",
      connector: "#C4A574",
    },
  },
];

export const monarchHillsWalkthroughPlaceholder: DemoWalkthroughStep[] = [
  {
    id: "discover",
    title: "Parents discover your school",
    description: "Families find you online and explore your outdoor enrichment program.",
    icon: "globe",
    scrollTarget: "top",
    theme: {
      bg: "#EEF2F8",
      bgHover: "#E4EBF4",
      bgActive: "#E4EBF4",
      border: "#C5D4E8",
      iconBg: "#233975",
      iconColor: "#FFFFFF",
      titleColor: "#233975",
      descColor: "#5A6478",
      connector: "#233975",
    },
  },
  {
    id: "join-interest-list",
    title: "Parents join the interest list",
    description: "Parents submit the interest form to learn more about future enrollment.",
    icon: "calendarDays",
    scrollTarget: "form",
    theme: {
      bg: "#FFF4ED",
      bgHover: "#FFE8D8",
      bgActive: "#FFE8D8",
      border: "#F5D0B8",
      iconBg: "#F26522",
      iconColor: "#FFFFFF",
      titleColor: "#233975",
      descColor: "#5A6478",
      connector: "#F26522",
    },
  },
  {
    id: "view-lead",
    title: "View the lead in your admin",
    description: "The inquiry appears in your admin dashboard so you can follow up.",
    preview: "admin",
    initialAdmissionsTab: "submissions",
    animateNewSubmission: true,
    icon: "layoutDashboard",
    theme: {
      bg: "#EEF2F8",
      bgHover: "#E4EBF4",
      bgActive: "#E4EBF4",
      border: "#C5D4E8",
      iconBg: "#233975",
      iconColor: "#FFFFFF",
      titleColor: "#233975",
      descColor: "#5A6478",
      connector: "#233975",
    },
  },
  {
    id: "send-application-link",
    title: "Send enrollment link",
    description: "After connecting with the family, you can send the enrollment link.",
    preview: "admin",
    icon: "link",
    initialSelectedLeadId: "l0",
    autoSendEnrollmentLink: true,
    theme: {
      bg: "#FFF4ED",
      bgHover: "#FFE8D8",
      bgActive: "#FFE8D8",
      border: "#F5D0B8",
      iconBg: "#F26522",
      iconColor: "#FFFFFF",
      titleColor: "#233975",
      descColor: "#5A6478",
      connector: "#F26522",
    },
  },
  {
    id: "parent-enrollment",
    title: "Parents go through the enrollment",
    description: "Families complete the enrollment checklist from their parent portal.",
    preview: "parent",
    initialParentTab: "enrollment",
    icon: "clipboardCheck",
    theme: {
      bg: "#EEF2F8",
      bgHover: "#E4EBF4",
      bgActive: "#E4EBF4",
      border: "#C5D4E8",
      iconBg: "#233975",
      iconColor: "#FFFFFF",
      titleColor: "#233975",
      descColor: "#5A6478",
      connector: "#233975",
    },
  },
  {
    id: "parent-pays-tuition",
    title: "Parent pays tuition",
    description:
      "Families pay tuition and manage invoices from the parent portal.",
    preview: "parent",
    initialParentTab: "billing",
    icon: "creditCard",
    theme: {
      bg: "#FFF4ED",
      bgHover: "#FFE8D8",
      bgActive: "#FFE8D8",
      border: "#F5D0B8",
      iconBg: "#F26522",
      iconColor: "#FFFFFF",
      titleColor: "#233975",
      descColor: "#5A6478",
      connector: "#F26522",
    },
  },
  {
    id: "teacher-attendance",
    title: "Teachers take attendance",
    description: "Staff track daily attendance from the teacher portal.",
    preview: "teacher",
    initialTeacherTab: "attendance",
    icon: "clipboardList",
    theme: {
      bg: "#EEF2F8",
      bgHover: "#E4EBF4",
      bgActive: "#E4EBF4",
      border: "#C5D4E8",
      iconBg: "#233975",
      iconColor: "#FFFFFF",
      titleColor: "#233975",
      descColor: "#5A6478",
      connector: "#233975",
    },
  },
  {
    id: "get-in-touch",
    title: "Questions? Let's connect",
    description: "Share feedback or ask about anything you saw in this concept.",
    talkingPoint:
      "We'd love to hear what resonated — or what you'd want to change.",
    preview: "contact",
    icon: "messageCircle",
    theme: {
      bg: "#FFF4ED",
      bgHover: "#FFE8D8",
      bgActive: "#FFE8D8",
      border: "#F5D0B8",
      iconBg: "#F26522",
      iconColor: "#FFFFFF",
      titleColor: "#233975",
      descColor: "#5A6478",
      connector: "#F26522",
    },
  },
];
