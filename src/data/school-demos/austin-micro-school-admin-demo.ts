/** Shared Austin Micro School logo — text wordmark used everywhere branding appears in the demo. */
export const AUSTIN_MICRO_SCHOOL_LOGO = {
  src: "",
  alt: "Austin Micro School",
  text: "Austin Micro School",
  textClassName:
    "font-heading text-base sm:text-lg font-semibold tracking-tight",
} as const;

export const AUSTIN_MICRO_SCHOOL_ADMIN_LOGO = AUSTIN_MICRO_SCHOOL_LOGO;

export const AUSTIN_MICRO_SCHOOL_ADMIN_COMPACT_ROWS = 5;

export const AUSTIN_MICRO_SCHOOL_ADMIN_COLORS = {
  bg: "#f5f7fa",
  border: "#e2e8f0",
  borderStrong: "#0C8A3A",
  accent: "#0C8A3A",
  accentBright: "#0A7532",
  accentLight: "rgba(12, 138, 58, 0.10)",
  secondaryBtnBorder: "rgba(12, 138, 58, 0.22)",
  accentGlow: "rgba(12, 138, 58, 0.12)",
  accentMid: "#143664",
  accentDark: "#0f2a50",
  clay: "#CFA24C",
  clayBg: "rgba(207, 162, 76, 0.12)",
  clayBorder: "rgba(207, 162, 76, 0.35)",
  textPrimary: "#143664",
  textSecondary: "#5a6478",
} as const;

import { adminContentOverrides as austinMicroSchoolAdminContentOverrides } from "./admin-content/austin-micro-school";

import type { SchoolAdminDemoConfig } from "./demo-dashboard-types";

export const austinMicroSchoolAdminDemoConfig: SchoolAdminDemoConfig = {
  slug: "austin-micro-school",
  logo: AUSTIN_MICRO_SCHOOL_ADMIN_LOGO,
  colors: AUSTIN_MICRO_SCHOOL_ADMIN_COLORS,
  compactRows: AUSTIN_MICRO_SCHOOL_ADMIN_COMPACT_ROWS,
  copy: {
    schoolName: "Austin Micro School",
    schoolShortName: "Austin Micro",
    officeName: "Austin Micro School Office",
    locationSubtitle: "Austin Micro School — South Austin · 2026–27 Enrollment",
  },
  contentOverrides: austinMicroSchoolAdminContentOverrides,
};
