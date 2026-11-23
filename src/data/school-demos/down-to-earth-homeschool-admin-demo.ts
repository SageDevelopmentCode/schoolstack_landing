/** Shared Down to Earth Co-op logo — used everywhere branding appears in the demo. */
export const DOWN_TO_EARTH_HOMESCHOOL_LOGO = {
  src: "/images/demo/downtoearthhomeschool/logo.png",
  alt: "Down to Earth Co-op",
  width: 56,
  height: 56,
} as const;

export const DOWN_TO_EARTH_HOMESCHOOL_ADMIN_LOGO = DOWN_TO_EARTH_HOMESCHOOL_LOGO;

export const DOWN_TO_EARTH_HOMESCHOOL_ADMIN_COMPACT_ROWS = 5;

export const DOWN_TO_EARTH_HOMESCHOOL_ADMIN_COLORS = {
  bg: "#f5f9f7",
  border: "#DFEAE4",
  borderStrong: "#1F7A58",
  accent: "#1F7A58",
  accentBright: "#2A936C",
  accentLight: "rgba(31, 122, 88, 0.10)",
  secondaryBtnBorder: "rgba(31, 122, 88, 0.22)",
  accentGlow: "rgba(31, 122, 88, 0.12)",
  accentMid: "#1F7A58",
  accentDark: "#155A40",
  clay: "#8FD3B0",
  clayBg: "rgba(143, 211, 176, 0.14)",
  clayBorder: "rgba(143, 211, 176, 0.38)",
  textPrimary: "#15212E",
  textSecondary: "#556170",
} as const;

import { adminContentOverrides as downToEarthHomeschoolAdminContentOverrides } from "./admin-content/down-to-earth-homeschool";
import type { SchoolAdminDemoConfig } from "./demo-dashboard-types";

export const downToEarthHomeschoolAdminDemoConfig: SchoolAdminDemoConfig = {
  slug: "down-to-earth-homeschool",
  logo: DOWN_TO_EARTH_HOMESCHOOL_ADMIN_LOGO,
  colors: DOWN_TO_EARTH_HOMESCHOOL_ADMIN_COLORS,
  compactRows: DOWN_TO_EARTH_HOMESCHOOL_ADMIN_COMPACT_ROWS,
  copy: {
    schoolName: "Down to Earth Co-op",
    schoolShortName: "Down to Earth",
    officeName: "Down to Earth Co-op Directors",
    locationSubtitle: "Lighthouse Point, Florida · Christian homeschool co-op, K–8",
  },
  contentOverrides: downToEarthHomeschoolAdminContentOverrides,
};
