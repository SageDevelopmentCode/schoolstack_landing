export type DemoWalkthroughIcon =
  | "globe"
  | "calendarDays"
  | "layoutDashboard"
  | "gitBranch"
  | "link"
  | "clipboardCheck";

export type DemoWalkthroughAdmissionsTab = "flows" | "submissions";

export type DemoWalkthroughParentTab = "enrollment" | "home";

export type DemoWalkthroughPreview = "website" | "admin" | "parent";

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
    id: "enrollment-checklist-flow",
    title: "View your enrollment checklist flow",
    description: "See the checklist families complete when they enroll.",
    preview: "admin",
    initialAdmissionsTab: "flows",
    initialSelectedFlowId: "flow-2",
    icon: "gitBranch",
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
    id: "send-application-link",
    title: "Send enrollment link",
    description: "After the discovery call, you can send the enrollment link.",
    preview: "admin",
    icon: "link",
    initialSelectedLeadId: "l0",
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
];
