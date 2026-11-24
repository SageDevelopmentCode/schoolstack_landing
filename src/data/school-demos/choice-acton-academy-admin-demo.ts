/** Shared CHOICE logo — used everywhere branding appears in the demo. */
export const CHOICE_ACTON_ACADEMY_LOGO = {
  src: "/images/demo/choiceactonacademy/logo.png",
  alt: "CHOICE wordmark",
  width: 144,
  height: 38,
} as const;

export const CHOICE_ACTON_ACADEMY_ADMIN_LOGO = CHOICE_ACTON_ACADEMY_LOGO;

export const CHOICE_ACTON_ACADEMY_ADMIN_COMPACT_ROWS = 5;

export const CHOICE_ACTON_ACADEMY_ADMIN_COLORS = {
  bg: "#f4f7fb",
  border: "#D3DEEC",
  borderStrong: "#0B2A67",
  accent: "#0B2A67",
  accentBright: "#1A3D85",
  accentLight: "rgba(11, 42, 103, 0.10)",
  secondaryBtnBorder: "rgba(11, 42, 103, 0.22)",
  accentGlow: "rgba(11, 42, 103, 0.12)",
  accentMid: "#0B2A67",
  accentDark: "#071C45",
  clay: "#78EB2C",
  clayBg: "rgba(120, 235, 44, 0.18)",
  clayBorder: "rgba(120, 235, 44, 0.42)",
  textPrimary: "#15212E",
  textSecondary: "#556170",
} as const;

import { adminContentOverrides as choiceActonAcademyAdminContentOverrides } from "./admin-content/choice-acton-academy";
import type { SchoolAdminDemoConfig } from "./demo-dashboard-types";

export const choiceActonAcademyAdminDemoConfig: SchoolAdminDemoConfig = {
  slug: "choice-acton-academy",
  logo: CHOICE_ACTON_ACADEMY_ADMIN_LOGO,
  colors: CHOICE_ACTON_ACADEMY_ADMIN_COLORS,
  compactRows: CHOICE_ACTON_ACADEMY_ADMIN_COMPACT_ROWS,
  copy: {
    schoolName: "CHOICE: An Acton Academy",
    schoolShortName: "CHOICE",
    officeName: "CHOICE Office",
    locationSubtitle: "Woods Cross, Utah · Learner-driven Acton Academy, ages 4–14",
  },
  contentOverrides: choiceActonAcademyAdminContentOverrides,
};
