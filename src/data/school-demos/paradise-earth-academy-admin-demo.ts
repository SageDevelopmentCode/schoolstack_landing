/** Shared Paradise Earth Academy logo — used everywhere branding appears in the demo. */
export const PARADISE_EARTH_ACADEMY_LOGO = {
  src: "/images/demo/paradiseearthacademy/PEA_1line-4.svg",
  alt: "Paradise Earth Academy",
  width: 220,
  height: 40,
} as const;

export const PARADISE_EARTH_ACADEMY_ADMIN_LOGO = PARADISE_EARTH_ACADEMY_LOGO;

export const PARADISE_EARTH_ACADEMY_ADMIN_COMPACT_ROWS = 5;

export const PARADISE_EARTH_ACADEMY_ADMIN_COLORS = {
  bg: "#F9F7F2",
  border: "rgba(51, 51, 51, 0.10)",
  borderStrong: "#EB8444",
  accent: "#EB8444",
  accentBright: "#D9732F",
  accentLight: "rgba(235, 132, 68, 0.10)",
  secondaryBtnBorder: "rgba(235, 132, 68, 0.22)",
  accentGlow: "rgba(235, 132, 68, 0.12)",
  accentMid: "#BE4B8E",
  accentDark: "#333333",
  clay: "#FBB88D",
  clayBg: "rgba(251, 184, 141, 0.15)",
  clayBorder: "rgba(251, 184, 141, 0.35)",
  textPrimary: "#333333",
  textSecondary: "#666666",
} as const;

import { adminContentOverrides as paradiseEarthAcademyAdminContentOverrides } from "./admin-content/paradise-earth-academy";

import type { SchoolAdminDemoConfig } from "./demo-dashboard-types";

export const paradiseEarthAcademyAdminDemoConfig: SchoolAdminDemoConfig = {
  slug: "paradise-earth-academy",
  logo: PARADISE_EARTH_ACADEMY_ADMIN_LOGO,
  colors: PARADISE_EARTH_ACADEMY_ADMIN_COLORS,
  compactRows: PARADISE_EARTH_ACADEMY_ADMIN_COMPACT_ROWS,
  copy: {
    schoolName: "Paradise Earth Academy",
    schoolShortName: "Paradise Earth",
    officeName: "Paradise Earth Academy Office",
    locationSubtitle: "Paradise Earth Academy — Gilbert, AZ · 2026–27 Enrollment",
  },
  contentOverrides: paradiseEarthAcademyAdminContentOverrides,
};
