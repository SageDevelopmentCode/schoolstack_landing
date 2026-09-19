/** Shared The FOCUS Academy logo — used everywhere branding appears in the demo. */
export const THE_FOCUS_ACADEMY_LOGO = {
  src: "/images/demo/thefocusacademy/Focus Academy Logo_1_edited_edited.avif",
  alt: "The FOCUS Academy",
  width: 180,
  height: 48,
} as const;

export const THE_FOCUS_ACADEMY_ADMIN_LOGO = THE_FOCUS_ACADEMY_LOGO;

export const THE_FOCUS_ACADEMY_ADMIN_COMPACT_ROWS = 5;

export const THE_FOCUS_ACADEMY_ADMIN_COLORS = {
  bg: "#F7F4ED",
  border: "#E9DFC9",
  borderStrong: "#2C8C8C",
  accent: "#2C8C8C",
  accentBright: "#173B5B",
  accentLight: "rgba(44, 140, 140, 0.10)",
  secondaryBtnBorder: "rgba(44, 140, 140, 0.22)",
  accentGlow: "rgba(44, 140, 140, 0.12)",
  accentMid: "#173B5B",
  accentDark: "#102B43",
  clay: "#D6A64B",
  clayBg: "rgba(214, 166, 75, 0.12)",
  clayBorder: "rgba(214, 166, 75, 0.35)",
  textPrimary: "#1B2631",
  textSecondary: "#5B6974",
} as const;

import { adminContentOverrides as theFocusAcademyAdminContentOverrides } from "./admin-content/the-focus-academy";

import type { SchoolAdminDemoConfig } from "./demo-dashboard-types";

export const theFocusAcademyAdminDemoConfig: SchoolAdminDemoConfig = {
  slug: "the-focus-academy",
  logo: THE_FOCUS_ACADEMY_ADMIN_LOGO,
  colors: THE_FOCUS_ACADEMY_ADMIN_COLORS,
  compactRows: THE_FOCUS_ACADEMY_ADMIN_COMPACT_ROWS,
  copy: {
    schoolName: "The FOCUS Academy",
    schoolShortName: "FOCUS",
    officeName: "The FOCUS Academy Office",
    locationSubtitle:
      "The FOCUS Academy — Memphis area · 2026–27 Enrollment",
  },
  contentOverrides: theFocusAcademyAdminContentOverrides,
};
