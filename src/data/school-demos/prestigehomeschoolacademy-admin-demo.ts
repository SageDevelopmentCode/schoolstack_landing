/** Shared Prestige Homeschool Academy logo — use everywhere branding appears in the demo. */
export const PRESTIGE_HOMESCHOOL_ACADEMY_ADMIN_LOGO = {
  src: "/images/demo/prestigehomeschoolacademy/qt=q_95.webp",
  alt: "Prestige Homeschool Academy",
  width: 180,
  height: 52,
} as const;

export const PRESTIGE_HOMESCHOOL_ACADEMY_ADMIN_COMPACT_ROWS = 5;

export const PRESTIGE_HOMESCHOOL_ACADEMY_ADMIN_COLORS = {
  bg: "#FFFFFF",
  border: "#E8DFC8",
  borderStrong: "#D9C9A3",
  accent: "#1087E5",
  accentBright: "#0879D4",
  accentLight: "rgba(16, 135, 229, 0.10)",
  secondaryBtnBorder: "rgba(16, 135, 229, 0.22)",
  accentGlow: "rgba(16, 135, 229, 0.12)",
  accentMid: "#0879D4",
  accentDark: "#066BB8",
  clay: "#D4AF37",
  clayBg: "rgba(212, 175, 55, 0.12)",
  clayBorder: "rgba(212, 175, 55, 0.30)",
  textPrimary: "#1F1F1F",
  textSecondary: "#5C5C5C",
} as const;

import { adminContentOverrides as prestigeHomeschoolAcademyAdminContentOverrides } from "./admin-content/prestige-homeschool-academy";

import type { SchoolAdminDemoConfig } from "./demo-dashboard-types";

export const prestigeHomeschoolAcademyAdminDemoConfig: SchoolAdminDemoConfig = {
  slug: "prestige-homeschool-academy",
  logo: PRESTIGE_HOMESCHOOL_ACADEMY_ADMIN_LOGO,
  colors: PRESTIGE_HOMESCHOOL_ACADEMY_ADMIN_COLORS,
  compactRows: PRESTIGE_HOMESCHOOL_ACADEMY_ADMIN_COMPACT_ROWS,
  copy: {
    schoolName: "Prestige Homeschool Academy",
    schoolShortName: "Prestige Homeschool",
    officeName: "Prestige Homeschool Academy Office",
    locationSubtitle: "Mud Kitchen School — Spring / Summer 2026",
  },
  contentOverrides: prestigeHomeschoolAcademyAdminContentOverrides,
};
