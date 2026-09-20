/** Shared Freedom Prep Academy logo — used everywhere branding appears in the demo. */
export const FREEDOM_PREP_ACADEMY_LOGO = {
  src: "/images/demo/freedomprep/FPA-logo-white-2048x437.png",
  alt: "Freedom Prep Academy",
  width: 200,
  height: 43,
  logoOnLightClassName: "brightness-0",
} as const;

export const FREEDOM_PREP_ACADEMY_ADMIN_LOGO = FREEDOM_PREP_ACADEMY_LOGO;

export const FREEDOM_PREP_ACADEMY_ADMIN_COMPACT_ROWS = 5;

export const FREEDOM_PREP_ACADEMY_ADMIN_COLORS = {
  bg: "#F5F8FC",
  border: "#B8D4F0",
  borderStrong: "#1467B9",
  accent: "#1467B9",
  accentBright: "#0D2F5D",
  accentLight: "rgba(20, 103, 185, 0.10)",
  secondaryBtnBorder: "rgba(20, 103, 185, 0.22)",
  accentGlow: "rgba(20, 103, 185, 0.12)",
  accentMid: "#0D2F5D",
  accentDark: "#0A2447",
  clay: "#F4B942",
  clayBg: "rgba(244, 185, 66, 0.12)",
  clayBorder: "rgba(244, 185, 66, 0.35)",
  textPrimary: "#182230",
  textSecondary: "#536274",
} as const;

import { adminContentOverrides as freedomPrepAcademyAdminContentOverrides } from "./admin-content/freedom-prep-academy";

import type { SchoolAdminDemoConfig } from "./demo-dashboard-types";

export const freedomPrepAcademyAdminDemoConfig: SchoolAdminDemoConfig = {
  slug: "freedom-prep-academy",
  logo: FREEDOM_PREP_ACADEMY_ADMIN_LOGO,
  colors: FREEDOM_PREP_ACADEMY_ADMIN_COLORS,
  compactRows: FREEDOM_PREP_ACADEMY_ADMIN_COMPACT_ROWS,
  copy: {
    schoolName: "Freedom Prep Academy",
    schoolShortName: "Freedom Prep",
    officeName: "Freedom Prep Academy Office",
    locationSubtitle:
      "Freedom Prep Academy — Arizona K–12 Charter · Serving families statewide",
  },
  contentOverrides: freedomPrepAcademyAdminContentOverrides,
};
