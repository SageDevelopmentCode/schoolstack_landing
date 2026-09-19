/** Shared Tapestry Academy logo — used everywhere branding appears in the demo. */
export const TAPESTRY_ACADEMY_LOGO = {
  src: "/images/demo/tapestryacademy/90a441_38e4afc3c06546109c1206c66313c6cf~mv2.avif",
  alt: "Tapestry Academy",
  width: 160,
  height: 56,
} as const;

export const TAPESTRY_ACADEMY_ADMIN_LOGO = TAPESTRY_ACADEMY_LOGO;

export const TAPESTRY_ACADEMY_ADMIN_COMPACT_ROWS = 5;

export const TAPESTRY_ACADEMY_ADMIN_COLORS = {
  bg: "#FCFBF7",
  border: "#E9DFC9",
  borderStrong: "#173B52",
  accent: "#2E7D7B",
  accentBright: "#256A68",
  accentLight: "rgba(46, 125, 123, 0.10)",
  secondaryBtnBorder: "rgba(23, 59, 82, 0.22)",
  accentGlow: "rgba(46, 125, 123, 0.12)",
  accentMid: "#256A68",
  accentDark: "#173B52",
  clay: "#D46E52",
  clayBg: "rgba(212, 110, 82, 0.12)",
  clayBorder: "rgba(212, 110, 82, 0.35)",
  textPrimary: "#173B52",
  textSecondary: "#66737A",
} as const;

import { adminContentOverrides as tapestryAcademyAdminContentOverrides } from "./admin-content/tapestry-academy";

import type { SchoolAdminDemoConfig } from "./demo-dashboard-types";

export const tapestryAcademyAdminDemoConfig: SchoolAdminDemoConfig = {
  slug: "tapestry-academy",
  logo: TAPESTRY_ACADEMY_ADMIN_LOGO,
  colors: TAPESTRY_ACADEMY_ADMIN_COLORS,
  compactRows: TAPESTRY_ACADEMY_ADMIN_COMPACT_ROWS,
  copy: {
    schoolName: "Tapestry Academy",
    schoolShortName: "Tapestry",
    officeName: "Tapestry Academy Office",
    locationSubtitle:
      "Tapestry Academy — East Boca Raton, FL · Grades K–12",
  },
  contentOverrides: tapestryAcademyAdminContentOverrides,
};
