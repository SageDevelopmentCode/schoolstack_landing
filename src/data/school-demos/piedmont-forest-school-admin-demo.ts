/** Shared Piedmont Forest School logo — used everywhere branding appears in the demo. */
export const PIEDMONT_FOREST_SCHOOL_LOGO = {
  src: "/images/demo/piedmontforestschool/logo.jpeg",
  alt: "Piedmont Forest School",
  width: 180,
  height: 48,
} as const;

export const PIEDMONT_FOREST_SCHOOL_ADMIN_LOGO = PIEDMONT_FOREST_SCHOOL_LOGO;

export const PIEDMONT_FOREST_SCHOOL_ADMIN_COMPACT_ROWS = 5;

export const PIEDMONT_FOREST_SCHOOL_ADMIN_COLORS = {
  bg: "#F7F3E8",
  border: "#E9DFC9",
  borderStrong: "#355B3A",
  accent: "#355B3A",
  accentBright: "#1F3D2A",
  accentLight: "rgba(53, 91, 58, 0.10)",
  secondaryBtnBorder: "rgba(53, 91, 58, 0.22)",
  accentGlow: "rgba(53, 91, 58, 0.12)",
  accentMid: "#1F3D2A",
  accentDark: "#1F3D2A",
  clay: "#B55D3B",
  clayBg: "rgba(181, 93, 59, 0.12)",
  clayBorder: "rgba(181, 93, 59, 0.35)",
  textPrimary: "#203126",
  textSecondary: "#607064",
} as const;

import { adminContentOverrides as piedmontForestSchoolAdminContentOverrides } from "./admin-content/piedmont-forest-school";

import type { SchoolAdminDemoConfig } from "./demo-dashboard-types";

export const piedmontForestSchoolAdminDemoConfig: SchoolAdminDemoConfig = {
  slug: "piedmont-forest-school",
  logo: PIEDMONT_FOREST_SCHOOL_ADMIN_LOGO,
  colors: PIEDMONT_FOREST_SCHOOL_ADMIN_COLORS,
  compactRows: PIEDMONT_FOREST_SCHOOL_ADMIN_COMPACT_ROWS,
  copy: {
    schoolName: "Piedmont Forest School",
    schoolShortName: "PFS",
    officeName: "Piedmont Forest School Office",
    locationSubtitle:
      "Piedmont Forest School — Winston-Salem, NC · 2026–27 Enrollment",
  },
  contentOverrides: piedmontForestSchoolAdminContentOverrides,
};
