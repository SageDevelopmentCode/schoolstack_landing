import {
  ROOTED_MEADOWS_ADMIN_COLORS,
  ROOTED_MEADOWS_ADMIN_LOGO,
} from "@/data/school-demos/rootedmeadows-admin-demo";
import type {
  BrandingFieldDef,
  FeatureDef,
  OrganizationBranding,
  OrganizationFeatures,
} from "./types";

export const DEFAULT_BRANDING: OrganizationBranding = {
  colors: { ...ROOTED_MEADOWS_ADMIN_COLORS },
  logo: {
    src: ROOTED_MEADOWS_ADMIN_LOGO.src,
    alt: ROOTED_MEADOWS_ADMIN_LOGO.alt,
    width: ROOTED_MEADOWS_ADMIN_LOGO.width,
    height: ROOTED_MEADOWS_ADMIN_LOGO.height,
  },
  typography: {
    headingFont: "",
    bodyFont: "",
  },
};

export const BRANDING_FIELDS: BrandingFieldDef[] = [
  { path: "colors.accent", label: "Primary accent", type: "color", group: "Primary / accent" },
  { path: "colors.accentBright", label: "Accent bright", type: "color", group: "Primary / accent" },
  { path: "colors.accentMid", label: "Accent mid", type: "color", group: "Primary / accent" },
  { path: "colors.accentDark", label: "Accent dark", type: "color", group: "Primary / accent" },
  { path: "colors.accentLight", label: "Accent light", type: "color", group: "Primary / accent" },
  { path: "colors.accentGlow", label: "Accent glow", type: "color", group: "Primary / accent" },
  { path: "colors.bg", label: "Background", type: "color", group: "Surfaces" },
  { path: "colors.border", label: "Border", type: "color", group: "Surfaces" },
  { path: "colors.borderStrong", label: "Border strong", type: "color", group: "Surfaces" },
  { path: "colors.textPrimary", label: "Text primary", type: "color", group: "Text" },
  { path: "colors.textSecondary", label: "Text secondary", type: "color", group: "Text" },
  { path: "colors.clay", label: "Clay accent", type: "color", group: "Secondary / clay" },
  { path: "colors.clayBg", label: "Clay background", type: "color", group: "Secondary / clay" },
  { path: "colors.clayBorder", label: "Clay border", type: "color", group: "Secondary / clay" },
  { path: "colors.secondaryBtnBorder", label: "Secondary button border", type: "color", group: "Secondary / clay" },
  { path: "logo.src", label: "Logo URL", type: "text", group: "Logo" },
  { path: "logo.alt", label: "Logo alt text", type: "text", group: "Logo" },
  { path: "logo.width", label: "Logo width", type: "number", group: "Logo" },
  { path: "logo.height", label: "Logo height", type: "number", group: "Logo" },
  { path: "typography.headingFont", label: "Heading font", type: "text", group: "Typography" },
  { path: "typography.bodyFont", label: "Body font", type: "text", group: "Typography" },
];

export const DEFAULT_FEATURES: OrganizationFeatures = {
  admin: {
    dashboard: true,
    admissions: true,
    my_school: true,
    committees: true,
    schedule: true,
    finances: false,
    marketing: false,
  },
  teacher: {
    dashboard: true,
    my_students: true,
    my_hours: true,
    messages: true,
    calendar: true,
    attendance: true,
    feed: false,
    payroll: false,
    forms_documents: true,
  },
  parent: {
    portal: true,
    enrollment_checklist: true,
    billing: true,
    messages: true,
    calendar: true,
    attendance: true,
    feed: false,
    children: true,
    committees: false,
  },
  observation_booking: true,
  homeschool_drop_in: false,
};

export const FEATURE_CATALOG: FeatureDef[] = [
  { portal: "admin", key: "dashboard", label: "Dashboard", description: "Admin home overview" },
  { portal: "admin", key: "admissions", label: "Admissions", description: "Application pipeline and enrollment flows" },
  { portal: "admin", key: "my_school", label: "My School", description: "Students, programs, staff, classrooms, tuition" },
  { portal: "admin", key: "committees", label: "Committees", description: "Parent committee workspaces" },
  { portal: "admin", key: "schedule", label: "Schedule", description: "School calendar, events, and availability" },
  { portal: "admin", key: "finances", label: "Finances", description: "Budget, revenue, expenses, payroll" },
  { portal: "admin", key: "marketing", label: "Marketing", description: "Campaigns and outreach tools" },
  { portal: "teacher", key: "dashboard", label: "Dashboard", description: "Teacher home overview" },
  { portal: "teacher", key: "my_students", label: "My Students", description: "Student roster and profiles" },
  { portal: "teacher", key: "my_hours", label: "My Hours", description: "Time tracking and hours log" },
  { portal: "teacher", key: "messages", label: "Messages", description: "Parent and staff messaging" },
  { portal: "teacher", key: "calendar", label: "Calendar", description: "Events and schedule" },
  { portal: "teacher", key: "attendance", label: "Attendance", description: "Daily attendance tracking" },
  { portal: "teacher", key: "feed", label: "Feed", description: "School activity feed" },
  { portal: "teacher", key: "payroll", label: "Payroll", description: "Pay stubs and earnings" },
  { portal: "teacher", key: "forms_documents", label: "Forms & documents", description: "Required staff forms" },
  { portal: "parent", key: "portal", label: "Parent portal", description: "Master access to parent app" },
  { portal: "parent", key: "enrollment_checklist", label: "Enrollment checklist", description: "Post-acceptance onboarding steps" },
  { portal: "parent", key: "billing", label: "Billing / tuition", description: "Pay tuition and view invoices" },
  { portal: "parent", key: "messages", label: "Messages", description: "School messaging" },
  { portal: "parent", key: "calendar", label: "Calendar / events", description: "School calendar and events" },
  { portal: "parent", key: "attendance", label: "Attendance", description: "Child attendance history" },
  { portal: "parent", key: "feed", label: "School feed", description: "Photos and updates" },
  { portal: "parent", key: "children", label: "My children", description: "Child profiles and details" },
  { portal: "parent", key: "committees", label: "Committees", description: "Volunteer committee participation" },
  { portal: "additional", key: "observation_booking", label: "Observation booking", description: "Schedule classroom observation visits" },
  { portal: "additional", key: "homeschool_drop_in", label: "Homeschool drop-in", description: "Homeschool drop-in program module" },
];

export const PORTAL_LABELS: Record<string, string> = {
  admin: "Admin portal",
  teacher: "Teacher portal",
  parent: "Parent portal",
  additional: "Additional",
};

export const KNOWN_FEATURE_ROOT_KEYS = new Set(["admin", "teacher", "parent"]);

export const CATALOG_ADDITIONAL_KEYS = new Set(
  FEATURE_CATALOG.filter((f) => f.portal === "additional").map((f) => f.key),
);
