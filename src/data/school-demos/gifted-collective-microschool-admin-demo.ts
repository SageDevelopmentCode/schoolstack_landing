/** Shared Gifted Collective logo — used everywhere branding appears in the demo. */
export const GIFTED_COLLECTIVE_MICROSCHOOL_LOGO = {
  src: "/images/demo/giftedcollectivemicroschool/logo.png",
  alt: "The Gifted Collective logo",
  width: 54,
  height: 56,
} as const;

export const GIFTED_COLLECTIVE_MICROSCHOOL_ADMIN_LOGO = GIFTED_COLLECTIVE_MICROSCHOOL_LOGO;

export const GIFTED_COLLECTIVE_MICROSCHOOL_ADMIN_COMPACT_ROWS = 5;

export const GIFTED_COLLECTIVE_MICROSCHOOL_ADMIN_COLORS = {
  bg: "#f7f5fa",
  border: "#E0D7EC",
  borderStrong: "#2E1A47",
  accent: "#2E1A47",
  accentBright: "#432A63",
  accentLight: "rgba(46, 26, 71, 0.09)",
  secondaryBtnBorder: "rgba(46, 26, 71, 0.22)",
  accentGlow: "rgba(46, 26, 71, 0.12)",
  accentMid: "#2E1A47",
  accentDark: "#1E1030",
  clay: "#6D3FB8",
  clayBg: "rgba(109, 63, 184, 0.14)",
  clayBorder: "rgba(109, 63, 184, 0.38)",
  textPrimary: "#15212E",
  textSecondary: "#556170",
} as const;

import { adminContentOverrides as giftedCollectiveMicroschoolAdminContentOverrides } from "./admin-content/gifted-collective-microschool";
import type { SchoolAdminDemoConfig } from "./demo-dashboard-types";

export const giftedCollectiveMicroschoolAdminDemoConfig: SchoolAdminDemoConfig = {
  slug: "gifted-collective-microschool",
  logo: GIFTED_COLLECTIVE_MICROSCHOOL_ADMIN_LOGO,
  colors: GIFTED_COLLECTIVE_MICROSCHOOL_ADMIN_COLORS,
  compactRows: GIFTED_COLLECTIVE_MICROSCHOOL_ADMIN_COMPACT_ROWS,
  copy: {
    schoolName: "Gifted Microschool at The Gifted Collective",
    schoolShortName: "Gifted Microschool",
    officeName: "Gifted Collective Office",
    locationSubtitle: "Phoenix, Arizona · Gifted and 2e microschool",
  },
  contentOverrides: giftedCollectiveMicroschoolAdminContentOverrides,
};
