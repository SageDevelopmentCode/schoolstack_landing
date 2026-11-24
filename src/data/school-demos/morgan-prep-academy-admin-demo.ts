/** Shared Morgan Preparatory Academy for Boys logo — used everywhere branding appears in the demo. */
export const MORGAN_PREP_ACADEMY_LOGO = {
  src: "/images/demo/morganprepacademy/logo.png",
  alt: "Morgan Preparatory Academy crest",
  width: 56,
  height: 56,
} as const;

export const MORGAN_PREP_ACADEMY_ADMIN_LOGO = MORGAN_PREP_ACADEMY_LOGO;

export const MORGAN_PREP_ACADEMY_ADMIN_COMPACT_ROWS = 5;

export const MORGAN_PREP_ACADEMY_ADMIN_COLORS = {
  bg: "#faf6f0",
  border: "#DCCBB7",
  borderStrong: "#571310",
  accent: "#571310",
  accentBright: "#73201B",
  accentLight: "rgba(87, 19, 16, 0.10)",
  secondaryBtnBorder: "rgba(87, 19, 16, 0.22)",
  accentGlow: "rgba(87, 19, 16, 0.12)",
  accentMid: "#571310",
  accentDark: "#3A0D0B",
  clay: "#DDA75F",
  clayBg: "rgba(221, 167, 95, 0.14)",
  clayBorder: "rgba(221, 167, 95, 0.38)",
  textPrimary: "#15212E",
  textSecondary: "#556170",
} as const;

import { adminContentOverrides as morganPrepAcademyAdminContentOverrides } from "./admin-content/morgan-prep-academy";
import type { SchoolAdminDemoConfig } from "./demo-dashboard-types";

export const morganPrepAcademyAdminDemoConfig: SchoolAdminDemoConfig = {
  slug: "morgan-prep-academy",
  logo: MORGAN_PREP_ACADEMY_ADMIN_LOGO,
  colors: MORGAN_PREP_ACADEMY_ADMIN_COLORS,
  compactRows: MORGAN_PREP_ACADEMY_ADMIN_COMPACT_ROWS,
  copy: {
    schoolName: "Morgan Preparatory Academy for Boys",
    schoolShortName: "Morgan Prep",
    officeName: "Morgan Prep Office",
    locationSubtitle: "Plano, Texas · K–5 boys' microschool",
  },
  contentOverrides: morganPrepAcademyAdminContentOverrides,
};
