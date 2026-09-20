/** Shared Roots and Wings Microschool logo — text wordmark used everywhere branding appears in the demo. */
export const ROOTS_AND_WINGS_LOGO = {
  src: "",
  alt: "Roots and Wings Microschool",
  text: "Roots and Wings",
  textClassName:
    "font-heading text-xs sm:text-sm font-semibold tracking-tight leading-tight",
} as const;

export const ROOTS_AND_WINGS_ADMIN_LOGO = ROOTS_AND_WINGS_LOGO;

export const ROOTS_AND_WINGS_ADMIN_COMPACT_ROWS = 5;

export const ROOTS_AND_WINGS_ADMIN_COLORS = {
  bg: "#F7F2E8",
  border: "#D7E0D7",
  borderStrong: "#2E6B63",
  accent: "#2E6B63",
  accentBright: "#1F514A",
  accentLight: "rgba(46, 107, 99, 0.10)",
  secondaryBtnBorder: "rgba(46, 107, 99, 0.22)",
  accentGlow: "rgba(46, 107, 99, 0.12)",
  accentMid: "#1E2A33",
  accentDark: "#1F514A",
  clay: "#D9A441",
  clayBg: "rgba(217, 164, 65, 0.12)",
  clayBorder: "rgba(217, 164, 65, 0.35)",
  textPrimary: "#1E2A33",
  textSecondary: "#3D4950",
} as const;

import { adminContentOverrides as rootsAndWingsMicroschoolAdminContentOverrides } from "./admin-content/roots-and-wings-microschool";

import type { SchoolAdminDemoConfig } from "./demo-dashboard-types";

export const rootsAndWingsMicroschoolAdminDemoConfig: SchoolAdminDemoConfig = {
  slug: "roots-and-wings-microschool",
  logo: ROOTS_AND_WINGS_ADMIN_LOGO,
  colors: ROOTS_AND_WINGS_ADMIN_COLORS,
  compactRows: ROOTS_AND_WINGS_ADMIN_COMPACT_ROWS,
  copy: {
    schoolName: "Roots and Wings Microschool",
    schoolShortName: "RAWM",
    officeName: "Roots and Wings Microschool Office",
    locationSubtitle:
      "Roots and Wings Microschool — North Mesa, AZ · K–2 Availability",
  },
  contentOverrides: rootsAndWingsMicroschoolAdminContentOverrides,
};
