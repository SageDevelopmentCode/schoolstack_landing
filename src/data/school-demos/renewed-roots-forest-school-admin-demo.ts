/** Shared Renewed Roots Forest School logo — used everywhere branding appears in the demo. */
export const RENEWED_ROOTS_FOREST_SCHOOL_LOGO = {
  src: "/images/demo/renewedroots/logo.webp",
  alt: "Renewed Roots Forest School tree logo",
  width: 56,
  height: 56,
} as const;

export const RENEWED_ROOTS_FOREST_SCHOOL_ADMIN_LOGO = RENEWED_ROOTS_FOREST_SCHOOL_LOGO;

export const RENEWED_ROOTS_FOREST_SCHOOL_ADMIN_COMPACT_ROWS = 5;

export const RENEWED_ROOTS_FOREST_SCHOOL_ADMIN_COLORS = {
  bg: "#f6f4ef",
  border: "#D9D3C4",
  borderStrong: "#3D5C4F",
  accent: "#3D5C4F",
  accentBright: "#4C6E60",
  accentLight: "rgba(61, 92, 79, 0.10)",
  secondaryBtnBorder: "rgba(61, 92, 79, 0.22)",
  accentGlow: "rgba(61, 92, 79, 0.12)",
  accentMid: "#3D5C4F",
  accentDark: "#2B4238",
  clay: "#B8992E",
  clayBg: "rgba(184, 153, 46, 0.14)",
  clayBorder: "rgba(184, 153, 46, 0.38)",
  textPrimary: "#15212E",
  textSecondary: "#556170",
} as const;

import { adminContentOverrides as renewedRootsForestSchoolAdminContentOverrides } from "./admin-content/renewed-roots-forest-school";
import type { SchoolAdminDemoConfig } from "./demo-dashboard-types";

export const renewedRootsForestSchoolAdminDemoConfig: SchoolAdminDemoConfig = {
  slug: "renewed-roots-forest-school",
  logo: RENEWED_ROOTS_FOREST_SCHOOL_ADMIN_LOGO,
  colors: RENEWED_ROOTS_FOREST_SCHOOL_ADMIN_COLORS,
  compactRows: RENEWED_ROOTS_FOREST_SCHOOL_ADMIN_COMPACT_ROWS,
  copy: {
    schoolName: "Renewed Roots Forest School",
    schoolShortName: "Renewed Roots",
    officeName: "Renewed Roots Office",
    locationSubtitle: "Moorhead, Minnesota · Forest microschool",
  },
  contentOverrides: renewedRootsForestSchoolAdminContentOverrides,
};
