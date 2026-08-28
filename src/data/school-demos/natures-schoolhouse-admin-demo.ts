/** Shared Nature's Schoolhouse logo — used everywhere branding appears in the demo. */
export const NATURES_SCHOOLHOUSE_LOGO = {
  src: "/images/demo/natureschoolhouse/logo_cropped.avif",
  alt: "Nature's Schoolhouse Microschool",
  width: 180,
  height: 52,
} as const;

export const NATURES_SCHOOLHOUSE_ADMIN_LOGO = NATURES_SCHOOLHOUSE_LOGO;

export const NATURES_SCHOOLHOUSE_ADMIN_COMPACT_ROWS = 5;

export const NATURES_SCHOOLHOUSE_ADMIN_COLORS = {
  bg: "#F7F3EC",
  border: "#D9D4CC",
  borderStrong: "#3F7652",
  accent: "#3F7652",
  accentBright: "#2F5E40",
  accentLight: "rgba(63, 118, 82, 0.08)",
  secondaryBtnBorder: "rgba(63, 118, 82, 0.22)",
  accentGlow: "rgba(232, 74, 67, 0.12)",
  accentMid: "#3F7652",
  accentDark: "#2F5E40",
  clay: "#E84A43",
  clayBg: "rgba(232, 74, 67, 0.12)",
  clayBorder: "rgba(232, 74, 67, 0.35)",
  textPrimary: "#1E1E1E",
  textSecondary: "#8F8F8F",
} as const;

import { adminContentOverrides as naturesSchoolhouseAdminContentOverrides } from "./admin-content/natures-schoolhouse";

import type { SchoolAdminDemoConfig } from "./demo-dashboard-types";

export const naturesSchoolhouseAdminDemoConfig: SchoolAdminDemoConfig = {
  slug: "natures-schoolhouse",
  logo: NATURES_SCHOOLHOUSE_ADMIN_LOGO,
  colors: NATURES_SCHOOLHOUSE_ADMIN_COLORS,
  compactRows: NATURES_SCHOOLHOUSE_ADMIN_COMPACT_ROWS,
  copy: {
    schoolName: "Nature's Schoolhouse Microschool",
    schoolShortName: "Nature's Schoolhouse",
    officeName: "Nature's Schoolhouse Microschool Office",
    locationSubtitle: "Nature's Schoolhouse Microschool — Spring / Discovery Days",
  },
  contentOverrides: naturesSchoolhouseAdminContentOverrides,
};
