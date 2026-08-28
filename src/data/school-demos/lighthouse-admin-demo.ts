/** Shared Lighthouse Homeschool Academy logo — used everywhere branding appears in the demo. */
export const LIGHTHOUSE_LOGO = {
  src: "/images/demo/lighthousehomeschool/headerImg3435.png",
  alt: "Lighthouse Homeschool Academy",
  width: 220,
  height: 52,
} as const;

export const LIGHTHOUSE_ADMIN_LOGO = LIGHTHOUSE_LOGO;

export const LIGHTHOUSE_ADMIN_COMPACT_ROWS = 5;

export const LIGHTHOUSE_ADMIN_COLORS = {
  bg: "#f7f9fc",
  border: "#d9e2ea",
  borderStrong: "#336699",
  accent: "#336699",
  accentBright: "#1d519d",
  accentLight: "rgba(51, 102, 153, 0.10)",
  secondaryBtnBorder: "rgba(51, 102, 153, 0.22)",
  accentGlow: "rgba(51, 102, 153, 0.12)",
  accentMid: "#2a5580",
  accentDark: "#1d519d",
  clay: "#FFCC66",
  clayBg: "rgba(255, 204, 102, 0.12)",
  clayBorder: "rgba(255, 204, 102, 0.35)",
  textPrimary: "#333333",
  textSecondary: "#5f6b76",
} as const;

import { adminContentOverrides as lighthouseHomeschoolAdminContentOverrides } from "./admin-content/lighthouse-homeschool";

import type { SchoolAdminDemoConfig } from "./demo-dashboard-types";

export const lighthouseHomeschoolAdminDemoConfig: SchoolAdminDemoConfig = {
  slug: "lighthouse-homeschool",
  logo: LIGHTHOUSE_ADMIN_LOGO,
  colors: LIGHTHOUSE_ADMIN_COLORS,
  compactRows: LIGHTHOUSE_ADMIN_COMPACT_ROWS,
  copy: {
    schoolName: "Lighthouse Homeschool Academy",
    schoolShortName: "Lighthouse Homeschool",
    officeName: "Lighthouse Homeschool Academy Office",
    locationSubtitle: "Lighthouse Homeschool Academy — Fairview Park, OH · 2026–27 Enrollment",
  },
  contentOverrides: lighthouseHomeschoolAdminContentOverrides,
};
