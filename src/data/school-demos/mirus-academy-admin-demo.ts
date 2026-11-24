/** Shared Mirus Academy logo — used everywhere branding appears in the demo. */
export const MIRUS_ACADEMY_LOGO = {
  src: "/images/demo/mirusacademy/logo.jpg",
  alt: "Mirus Academy seal",
  width: 56,
  height: 56,
} as const;

export const MIRUS_ACADEMY_ADMIN_LOGO = MIRUS_ACADEMY_LOGO;

export const MIRUS_ACADEMY_ADMIN_COMPACT_ROWS = 5;

export const MIRUS_ACADEMY_ADMIN_COLORS = {
  bg: "#f6f7fb",
  border: "#D6DAE8",
  borderStrong: "#132460",
  accent: "#132460",
  accentBright: "#24398A",
  accentLight: "rgba(19, 36, 96, 0.10)",
  secondaryBtnBorder: "rgba(19, 36, 96, 0.22)",
  accentGlow: "rgba(19, 36, 96, 0.12)",
  accentMid: "#132460",
  accentDark: "#0C1840",
  clay: "#F2A541",
  clayBg: "rgba(242, 165, 65, 0.16)",
  clayBorder: "rgba(242, 165, 65, 0.40)",
  textPrimary: "#15212E",
  textSecondary: "#556170",
} as const;

import { adminContentOverrides as mirusAcademyAdminContentOverrides } from "./admin-content/mirus-academy";
import type { SchoolAdminDemoConfig } from "./demo-dashboard-types";

export const mirusAcademyAdminDemoConfig: SchoolAdminDemoConfig = {
  slug: "mirus-academy",
  logo: MIRUS_ACADEMY_ADMIN_LOGO,
  colors: MIRUS_ACADEMY_ADMIN_COLORS,
  compactRows: MIRUS_ACADEMY_ADMIN_COMPACT_ROWS,
  copy: {
    schoolName: "Mirus Academy",
    schoolShortName: "Mirus",
    officeName: "Mirus Office",
    locationSubtitle: "Old Town Katy, Texas · Private high school, 8th–12th",
  },
  contentOverrides: mirusAcademyAdminContentOverrides,
};
