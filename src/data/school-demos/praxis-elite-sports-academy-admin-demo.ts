/** Shared Praxis Elite logo — used everywhere branding appears in the demo. */
export const PRAXIS_ELITE_SPORTS_ACADEMY_LOGO = {
  src: "/images/demo/praxiselitesportsacademy/logo.png",
  alt: "Praxis Elite Sports Academy Junior Prep logo",
  width: 56,
  height: 56,
} as const;

export const PRAXIS_ELITE_SPORTS_ACADEMY_ADMIN_LOGO = PRAXIS_ELITE_SPORTS_ACADEMY_LOGO;

export const PRAXIS_ELITE_SPORTS_ACADEMY_ADMIN_COMPACT_ROWS = 5;

export const PRAXIS_ELITE_SPORTS_ACADEMY_ADMIN_COLORS = {
  bg: "#f8f6f1",
  border: "#E1DBCF",
  borderStrong: "#161616",
  accent: "#161616",
  accentBright: "#333333",
  accentLight: "rgba(22, 22, 22, 0.08)",
  secondaryBtnBorder: "rgba(22, 22, 22, 0.22)",
  accentGlow: "rgba(22, 22, 22, 0.10)",
  accentMid: "#161616",
  accentDark: "#000000",
  clay: "#C9902F",
  clayBg: "rgba(201, 144, 47, 0.16)",
  clayBorder: "rgba(201, 144, 47, 0.40)",
  textPrimary: "#15212E",
  textSecondary: "#556170",
} as const;

import { adminContentOverrides as praxisEliteSportsAcademyAdminContentOverrides } from "./admin-content/praxis-elite-sports-academy";
import type { SchoolAdminDemoConfig } from "./demo-dashboard-types";

export const praxisEliteSportsAcademyAdminDemoConfig: SchoolAdminDemoConfig = {
  slug: "praxis-elite-sports-academy",
  logo: PRAXIS_ELITE_SPORTS_ACADEMY_ADMIN_LOGO,
  colors: PRAXIS_ELITE_SPORTS_ACADEMY_ADMIN_COLORS,
  compactRows: PRAXIS_ELITE_SPORTS_ACADEMY_ADMIN_COMPACT_ROWS,
  copy: {
    schoolName: "Praxis Elite Sports Academy",
    schoolShortName: "Praxis Elite",
    officeName: "Praxis Elite Office",
    locationSubtitle: "San Diego, California · Middle school for student athletes, 6th–8th+",
  },
  contentOverrides: praxisEliteSportsAcademyAdminContentOverrides,
};
