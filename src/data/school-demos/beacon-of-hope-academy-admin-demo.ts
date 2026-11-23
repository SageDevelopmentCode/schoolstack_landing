/** Shared Beacon of Hope Academy logo — used everywhere branding appears in the demo. */
export const BEACON_OF_HOPE_ACADEMY_LOGO = {
  src: "/images/demo/beaconofhopeacademy/logo.png",
  alt: "Beacon of Hope Academy",
  width: 196,
  height: 42,
} as const;

export const BEACON_OF_HOPE_ACADEMY_ADMIN_LOGO = BEACON_OF_HOPE_ACADEMY_LOGO;

export const BEACON_OF_HOPE_ACADEMY_ADMIN_COMPACT_ROWS = 5;

export const BEACON_OF_HOPE_ACADEMY_ADMIN_COLORS = {
  bg: "#f6f8fb",
  border: "#E2E7EE",
  borderStrong: "#163A59",
  accent: "#163A59",
  accentBright: "#24527A",
  accentLight: "rgba(22, 58, 89, 0.10)",
  secondaryBtnBorder: "rgba(22, 58, 89, 0.22)",
  accentGlow: "rgba(22, 58, 89, 0.12)",
  accentMid: "#163A59",
  accentDark: "#0E2840",
  clay: "#F2B93B",
  clayBg: "rgba(242, 185, 59, 0.14)",
  clayBorder: "rgba(242, 185, 59, 0.38)",
  textPrimary: "#15212E",
  textSecondary: "#556170",
} as const;

import { adminContentOverrides as beaconOfHopeAcademyAdminContentOverrides } from "./admin-content/beacon-of-hope-academy";
import type { SchoolAdminDemoConfig } from "./demo-dashboard-types";

export const beaconOfHopeAcademyAdminDemoConfig: SchoolAdminDemoConfig = {
  slug: "beacon-of-hope-academy",
  logo: BEACON_OF_HOPE_ACADEMY_ADMIN_LOGO,
  colors: BEACON_OF_HOPE_ACADEMY_ADMIN_COLORS,
  compactRows: BEACON_OF_HOPE_ACADEMY_ADMIN_COMPACT_ROWS,
  copy: {
    schoolName: "Beacon of Hope Academy",
    schoolShortName: "Beacon of Hope",
    officeName: "Beacon of Hope Academy Office",
    locationSubtitle: "Greenacres, Florida · Faith-based special education, K–5",
  },
  contentOverrides: beaconOfHopeAcademyAdminContentOverrides,
};
