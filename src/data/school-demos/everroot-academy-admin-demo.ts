/** Shared EverRoot Academy logo — used everywhere branding appears in the demo. */
export const EVERROOT_ACADEMY_LOGO = {
  src: "/images/demo/everrootacademy/logo.webp",
  alt: "EverRoot Academy",
  width: 110,
  height: 56,
} as const;

export const EVERROOT_ACADEMY_ADMIN_LOGO = EVERROOT_ACADEMY_LOGO;

export const EVERROOT_ACADEMY_ADMIN_COMPACT_ROWS = 5;

export const EVERROOT_ACADEMY_ADMIN_COLORS = {
  bg: "#f5f8f8",
  border: "#DFE8E7",
  borderStrong: "#154A47",
  accent: "#154A47",
  accentBright: "#1F615D",
  accentLight: "rgba(21, 74, 71, 0.10)",
  secondaryBtnBorder: "rgba(21, 74, 71, 0.22)",
  accentGlow: "rgba(21, 74, 71, 0.12)",
  accentMid: "#154A47",
  accentDark: "#0E3331",
  clay: "#C9A23A",
  clayBg: "rgba(201, 162, 58, 0.14)",
  clayBorder: "rgba(201, 162, 58, 0.38)",
  textPrimary: "#15212E",
  textSecondary: "#556170",
} as const;

import { adminContentOverrides as everrootAcademyAdminContentOverrides } from "./admin-content/everroot-academy";
import type { SchoolAdminDemoConfig } from "./demo-dashboard-types";

export const everrootAcademyAdminDemoConfig: SchoolAdminDemoConfig = {
  slug: "everroot-academy",
  logo: EVERROOT_ACADEMY_ADMIN_LOGO,
  colors: EVERROOT_ACADEMY_ADMIN_COLORS,
  compactRows: EVERROOT_ACADEMY_ADMIN_COMPACT_ROWS,
  copy: {
    schoolName: "EverRoot Academy",
    schoolShortName: "EverRoot",
    officeName: "EverRoot Academy Office",
    locationSubtitle: "Crestview, Florida · Hybrid learning, grades 3–7",
  },
  contentOverrides: everrootAcademyAdminContentOverrides,
};
