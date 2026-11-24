/** Shared Heartsong Cottage School logo (rainbow and wordmark) — used everywhere branding appears in the demo. */
export const HEARTSONG_COTTAGE_SCHOOL_LOGO = {
  src: "/images/demo/heartsongcottageschool/logo.png",
  alt: "Heartsong Cottage School",
  width: 61,
  height: 56,
} as const;

export const HEARTSONG_COTTAGE_SCHOOL_ADMIN_LOGO = HEARTSONG_COTTAGE_SCHOOL_LOGO;

export const HEARTSONG_COTTAGE_SCHOOL_ADMIN_COMPACT_ROWS = 5;

export const HEARTSONG_COTTAGE_SCHOOL_ADMIN_COLORS = {
  bg: "#f8f7f4",
  border: "#E6E1DA",
  borderStrong: "#213472",
  accent: "#213472",
  accentBright: "#2F4691",
  accentLight: "rgba(33, 52, 114, 0.10)",
  secondaryBtnBorder: "rgba(33, 52, 114, 0.22)",
  accentGlow: "rgba(33, 52, 114, 0.12)",
  accentMid: "#213472",
  accentDark: "#16244F",
  clay: "#F97338",
  clayBg: "rgba(249, 115, 56, 0.14)",
  clayBorder: "rgba(249, 115, 56, 0.38)",
  textPrimary: "#1B2238",
  textSecondary: "#5A6072",
} as const;

import { adminContentOverrides as heartsongCottageSchoolAdminContentOverrides } from "./admin-content/heartsong-cottage-school";
import type { SchoolAdminDemoConfig } from "./demo-dashboard-types";

export const heartsongCottageSchoolAdminDemoConfig: SchoolAdminDemoConfig = {
  slug: "heartsong-cottage-school",
  logo: HEARTSONG_COTTAGE_SCHOOL_ADMIN_LOGO,
  colors: HEARTSONG_COTTAGE_SCHOOL_ADMIN_COLORS,
  compactRows: HEARTSONG_COTTAGE_SCHOOL_ADMIN_COMPACT_ROWS,
  copy: {
    schoolName: "Heartsong Cottage School",
    schoolShortName: "Heartsong",
    officeName: "Heartsong Cottage School",
    locationSubtitle: "Highland, Utah · Waldorf-inspired homeschool co-op",
  },
  contentOverrides: heartsongCottageSchoolAdminContentOverrides,
};
