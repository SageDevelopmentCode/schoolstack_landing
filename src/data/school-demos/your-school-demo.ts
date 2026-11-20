/**
 * "Your School": a placeholder brand for marketing art (Marketing Studio ads and posts).
 * It re-skins the real Garden website, parent, teacher and admin demos with a neutral name,
 * a sprout mark and a blue/orange palette, so an ad can say "this is what yours will look like"
 * without showing a real school. The content (leads, bills, messages) is the shared demo data.
 */
import type {
  SchoolAdminDemoColors,
  SchoolAdminDemoConfig,
  SchoolAdminDemoLogo,
  SchoolParentDemoConfig,
  SchoolTeacherDemoConfig,
} from "./demo-dashboard-types";
import type { SchoolWebsiteDemoConfig } from "./types";
import { defaultWebsiteDemoConfig } from "./default";
import { LUFF_LEARNING_TEACHER_PROGRAM_ORDER } from "./luff-learning-teacher-demo";

export const YOUR_SCHOOL_NAME = "Your School";

export const YOUR_SCHOOL_PALETTE = {
  primary: "#3E5C8A",
  primaryHover: "#34507A",
  primaryDeep: "#2C4468",
  ink: "#1C2638",
  accent: "#F0A04B",
  soft: "#E6EDF7",
} as const;

export const YOUR_SCHOOL_LOGO: SchoolAdminDemoLogo = {
  src: "/images/marketing/your-school-logo.svg",
  alt: YOUR_SCHOOL_NAME,
  width: 220,
  height: 52,
};

export const YOUR_SCHOOL_MARK_SRC = "/images/marketing/your-school-mark.svg";

const P = YOUR_SCHOOL_PALETTE;

export const YOUR_SCHOOL_ADMIN_COLORS: SchoolAdminDemoColors = {
  bg: "#f7f9fc",
  border: "#eeeeee",
  borderStrong: P.primary,
  accent: P.primary,
  accentBright: P.primaryHover,
  accentLight: "rgba(62, 92, 138, 0.10)",
  secondaryBtnBorder: "rgba(62, 92, 138, 0.22)",
  accentGlow: "rgba(62, 92, 138, 0.12)",
  accentMid: P.primaryDeep,
  accentDark: P.ink,
  clay: P.accent,
  clayBg: "rgba(240, 160, 75, 0.12)",
  clayBorder: "rgba(240, 160, 75, 0.35)",
  textPrimary: P.ink,
  textSecondary: "#718096",
};

export const yourSchoolAdminDemoConfig: SchoolAdminDemoConfig = {
  slug: "your-school",
  logo: YOUR_SCHOOL_LOGO,
  colors: YOUR_SCHOOL_ADMIN_COLORS,
  compactRows: 5,
  copy: {
    schoolName: YOUR_SCHOOL_NAME,
    schoolShortName: YOUR_SCHOOL_NAME,
    officeName: `${YOUR_SCHOOL_NAME} Office`,
    locationSubtitle: `${YOUR_SCHOOL_NAME} · 2026–27 Enrollment`,
  },
};

export const yourSchoolParentDemoConfig: SchoolParentDemoConfig = {
  slug: "your-school",
  logo: YOUR_SCHOOL_LOGO,
  colors: { accent: P.primary, accentHover: P.primaryHover },
  copy: {
    schoolName: YOUR_SCHOOL_NAME,
    schoolShortName: YOUR_SCHOOL_NAME,
    officeName: `${YOUR_SCHOOL_NAME} Office`,
  },
};

/** Same program keys as the shared teacher demo data, with neutral names. */
export const yourSchoolTeacherDemoConfig: SchoolTeacherDemoConfig = {
  slug: "your-school",
  logo: YOUR_SCHOOL_LOGO,
  accent: P.primary,
  accentHover: P.primaryHover,
  programLabels: {
    virtual_academy: "Little Learners",
    aep: "Lower School",
    creative_dramatics: "Upper School",
    fine_arts_friday: "Friday Club",
  },
  programOrder: LUFF_LEARNING_TEACHER_PROGRAM_ORDER,
  copy: { officeName: `${YOUR_SCHOOL_NAME} Office` },
};

/** Swap every occurrence of `from` in the string leaves of a plain data object. */
function rebrandStrings<T>(value: T, from: string, to: string): T {
  if (typeof value === "string") return value.split(from).join(to) as T;
  if (Array.isArray(value)) return value.map((item) => rebrandStrings(item, from, to)) as T;
  if (value && typeof value === "object") {
    return Object.fromEntries(Object.entries(value).map(([key, item]) => [key, rebrandStrings(item, from, to)])) as T;
  }
  return value;
}

export const yourSchoolWebsiteDemoConfig: SchoolWebsiteDemoConfig = {
  ...rebrandStrings(rebrandStrings(defaultWebsiteDemoConfig, "MudKitchen Microschool", YOUR_SCHOOL_NAME), "MudKitchen", YOUR_SCHOOL_NAME),
  slug: "your-school",
  schoolName: YOUR_SCHOOL_NAME,
  logo: YOUR_SCHOOL_LOGO,
  theme: {
    primary: P.primary,
    primaryHover: P.primaryHover,
    dark: P.primaryDeep,
    darkHover: "#22385A",
    lightBg: "#F1F5FB",
    lightBorder: "#DCE5F2",
    muted: "#5A77A3",
    badgeBg: "#E9EFF8",
    accentText: P.primary,
    pageBg: "#ffffff",
  },
};
