/** Shared Adelphia crest — used everywhere branding appears in the demo. */
export const ADELPHIA_CLASSICAL_CHRISTIAN_ACADEMY_LOGO = {
  src: "/images/demo/adelphiaclassicalchristianacademy/logo.png",
  alt: "Adelphia Classical Christian Academy crest",
  width: 58,
  height: 56,
} as const;

export const ADELPHIA_CLASSICAL_CHRISTIAN_ACADEMY_ADMIN_LOGO = ADELPHIA_CLASSICAL_CHRISTIAN_ACADEMY_LOGO;

export const ADELPHIA_CLASSICAL_CHRISTIAN_ACADEMY_ADMIN_COMPACT_ROWS = 5;

export const ADELPHIA_CLASSICAL_CHRISTIAN_ACADEMY_ADMIN_COLORS = {
  bg: "#f5f6f9",
  border: "#D9DCE6",
  borderStrong: "#16284C",
  accent: "#16284C",
  accentBright: "#263C68",
  accentLight: "rgba(22, 40, 76, 0.10)",
  secondaryBtnBorder: "rgba(22, 40, 76, 0.22)",
  accentGlow: "rgba(22, 40, 76, 0.12)",
  accentMid: "#16284C",
  accentDark: "#0D1A33",
  clay: "#E1BE58",
  clayBg: "rgba(225, 190, 88, 0.18)",
  clayBorder: "rgba(225, 190, 88, 0.45)",
  textPrimary: "#15212E",
  textSecondary: "#556170",
} as const;

import { adminContentOverrides as adelphiaClassicalChristianAcademyAdminContentOverrides } from "./admin-content/adelphia-classical-christian-academy";
import type { SchoolAdminDemoConfig } from "./demo-dashboard-types";

export const adelphiaClassicalChristianAcademyAdminDemoConfig: SchoolAdminDemoConfig = {
  slug: "adelphia-classical-christian-academy",
  logo: ADELPHIA_CLASSICAL_CHRISTIAN_ACADEMY_ADMIN_LOGO,
  colors: ADELPHIA_CLASSICAL_CHRISTIAN_ACADEMY_ADMIN_COLORS,
  compactRows: ADELPHIA_CLASSICAL_CHRISTIAN_ACADEMY_ADMIN_COMPACT_ROWS,
  copy: {
    schoolName: "Adelphia Classical Christian Academy",
    schoolShortName: "Adelphia",
    officeName: "Adelphia Office",
    locationSubtitle: "Orange, California · Classical Christian PSP, K–12",
  },
  contentOverrides: adelphiaClassicalChristianAcademyAdminContentOverrides,
};
