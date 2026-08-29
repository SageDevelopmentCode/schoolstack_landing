/** Shared Kinder Academy Prep School logo — used everywhere branding appears in the demo. */
export const KINDER_ACADEMY_PREP_SCHOOL_LOGO = {
  src: "/images/demo/kinderacademyprep/logo.png",
  alt: "Kinder Academy Prep School",
  width: 180,
  height: 106,
} as const;

export const KINDER_ACADEMY_PREP_SCHOOL_ADMIN_LOGO = KINDER_ACADEMY_PREP_SCHOOL_LOGO;

export const KINDER_ACADEMY_PREP_SCHOOL_ADMIN_COMPACT_ROWS = 5;

export const KINDER_ACADEMY_PREP_SCHOOL_ADMIN_COLORS = {
  bg: "#FFF9EF",
  border: "#E8DFD0",
  borderStrong: "#2B6CB0",
  accent: "#2B6CB0",
  accentBright: "#225A94",
  accentLight: "rgba(43, 108, 176, 0.10)",
  secondaryBtnBorder: "rgba(43, 108, 176, 0.22)",
  accentGlow: "rgba(43, 108, 176, 0.12)",
  accentMid: "#173B63",
  accentDark: "#122F4F",
  clay: "#E5A93D",
  clayBg: "rgba(229, 169, 61, 0.12)",
  clayBorder: "rgba(229, 169, 61, 0.35)",
  textPrimary: "#1D2939",
  textSecondary: "#475467",
} as const;

import { adminContentOverrides as kinderAcademyPrepSchoolAdminContentOverrides } from "./admin-content/kinder-academy-prep-school";

import type { SchoolAdminDemoConfig } from "./demo-dashboard-types";

export const kinderAcademyPrepSchoolAdminDemoConfig: SchoolAdminDemoConfig = {
  slug: "kinder-academy-prep-school",
  logo: KINDER_ACADEMY_PREP_SCHOOL_ADMIN_LOGO,
  colors: KINDER_ACADEMY_PREP_SCHOOL_ADMIN_COLORS,
  compactRows: KINDER_ACADEMY_PREP_SCHOOL_ADMIN_COMPACT_ROWS,
  copy: {
    schoolName: "Kinder Academy Prep School",
    schoolShortName: "Kinder Academy",
    officeName: "Kinder Academy Prep School Office",
    locationSubtitle: "Kinder Academy Prep School — Georgetown, TX · 2026–27 Enrollment",
  },
  contentOverrides: kinderAcademyPrepSchoolAdminContentOverrides,
};
