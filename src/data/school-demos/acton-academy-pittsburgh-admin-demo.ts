/** Shared Acton Academy Pittsburgh logo — used everywhere branding appears in the demo. */
export const ACTON_ACADEMY_PITTSBURGH_LOGO = {
  src: "/images/demo/actonacademy/logo.webp",
  alt: "Acton Academy Pittsburgh",
  width: 180,
  height: 48,
} as const;

export const ACTON_ACADEMY_PITTSBURGH_ADMIN_LOGO = ACTON_ACADEMY_PITTSBURGH_LOGO;

export const ACTON_ACADEMY_PITTSBURGH_ADMIN_COMPACT_ROWS = 5;

export const ACTON_ACADEMY_PITTSBURGH_ADMIN_COLORS = {
  bg: "#F7F2E8",
  border: "#E9DFC9",
  borderStrong: "#2F5A47",
  accent: "#2F5A47",
  accentBright: "#163C31",
  accentLight: "rgba(47, 90, 71, 0.10)",
  secondaryBtnBorder: "rgba(47, 90, 71, 0.22)",
  accentGlow: "rgba(47, 90, 71, 0.12)",
  accentMid: "#18352D",
  accentDark: "#163C31",
  clay: "#C96F4A",
  clayBg: "rgba(201, 111, 74, 0.12)",
  clayBorder: "rgba(201, 111, 74, 0.35)",
  textPrimary: "#18352D",
  textSecondary: "#607064",
} as const;

import { adminContentOverrides as actonAcademyPittsburghAdminContentOverrides } from "./admin-content/acton-academy-pittsburgh";

import type { SchoolAdminDemoConfig } from "./demo-dashboard-types";

export const actonAcademyPittsburghAdminDemoConfig: SchoolAdminDemoConfig = {
  slug: "acton-academy-pittsburgh",
  logo: ACTON_ACADEMY_PITTSBURGH_ADMIN_LOGO,
  colors: ACTON_ACADEMY_PITTSBURGH_ADMIN_COLORS,
  compactRows: ACTON_ACADEMY_PITTSBURGH_ADMIN_COMPACT_ROWS,
  copy: {
    schoolName: "Acton Academy Pittsburgh",
    schoolShortName: "Acton Pittsburgh",
    officeName: "Acton Academy Pittsburgh Office",
    locationSubtitle:
      "Acton Academy Pittsburgh — Wexford, PA · Pre-K–8 Applications",
  },
  contentOverrides: actonAcademyPittsburghAdminContentOverrides,
};
