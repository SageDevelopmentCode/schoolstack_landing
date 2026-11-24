/** Shared Elite Freeport logo — used everywhere branding appears in the demo. */
export const ELITE_PERFORMANCE_PREP_FREEPORT_LOGO = {
  src: "/images/demo/eliteperformanceprepfreeport/logo.png",
  alt: "Elite Performance Prep Academy logo",
  width: 56,
  height: 56,
} as const;

export const ELITE_PERFORMANCE_PREP_FREEPORT_ADMIN_LOGO = ELITE_PERFORMANCE_PREP_FREEPORT_LOGO;

export const ELITE_PERFORMANCE_PREP_FREEPORT_ADMIN_COMPACT_ROWS = 5;

export const ELITE_PERFORMANCE_PREP_FREEPORT_ADMIN_COLORS = {
  bg: "#f5f7f6",
  border: "#D9E2DC",
  borderStrong: "#0F172A",
  accent: "#0F172A",
  accentBright: "#1E293B",
  accentLight: "rgba(15, 23, 42, 0.08)",
  secondaryBtnBorder: "rgba(15, 23, 42, 0.20)",
  accentGlow: "rgba(15, 23, 42, 0.10)",
  accentMid: "#0F172A",
  accentDark: "#020617",
  clay: "#1FA637",
  clayBg: "rgba(31, 166, 55, 0.14)",
  clayBorder: "rgba(31, 166, 55, 0.40)",
  textPrimary: "#15212E",
  textSecondary: "#556170",
} as const;

import { adminContentOverrides as elitePerformancePrepFreeportAdminContentOverrides } from "./admin-content/elite-performance-prep-freeport";
import type { SchoolAdminDemoConfig } from "./demo-dashboard-types";

export const elitePerformancePrepFreeportAdminDemoConfig: SchoolAdminDemoConfig = {
  slug: "elite-performance-prep-freeport",
  logo: ELITE_PERFORMANCE_PREP_FREEPORT_ADMIN_LOGO,
  colors: ELITE_PERFORMANCE_PREP_FREEPORT_ADMIN_COLORS,
  compactRows: ELITE_PERFORMANCE_PREP_FREEPORT_ADMIN_COMPACT_ROWS,
  copy: {
    schoolName: "Elite Performance Prep Academy Freeport",
    schoolShortName: "Elite Freeport",
    officeName: "Elite Freeport Office",
    locationSubtitle: "Freeport, Florida · Personalized microschool, K–8",
  },
  contentOverrides: elitePerformancePrepFreeportAdminContentOverrides,
};
