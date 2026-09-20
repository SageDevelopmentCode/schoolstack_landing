/** Shared Family Lyceum logo — used everywhere branding appears in the demo. */
export const FAMILY_LYCEUM_LOGO = {
  src: "/images/demo/familylyceumn/images.png",
  alt: "Family Lyceum",
  width: 48,
  height: 48,
} as const;

export const FAMILY_LYCEUM_ADMIN_LOGO = FAMILY_LYCEUM_LOGO;

export const FAMILY_LYCEUM_ADMIN_COMPACT_ROWS = 5;

export const FAMILY_LYCEUM_ADMIN_COLORS = {
  bg: "#FBF7EF",
  border: "#D9D2C7",
  borderStrong: "#20364A",
  accent: "#20364A",
  accentBright: "#122534",
  accentLight: "rgba(32, 54, 74, 0.10)",
  secondaryBtnBorder: "rgba(32, 54, 74, 0.22)",
  accentGlow: "rgba(32, 54, 74, 0.12)",
  accentMid: "#122534",
  accentDark: "#122534",
  clay: "#D99B35",
  clayBg: "rgba(217, 155, 53, 0.12)",
  clayBorder: "rgba(217, 155, 53, 0.35)",
  textPrimary: "#122534",
  textSecondary: "#72695F",
} as const;

import { adminContentOverrides as familyLyceumAdminContentOverrides } from "./admin-content/family-lyceum";

import type { SchoolAdminDemoConfig } from "./demo-dashboard-types";

export const familyLyceumAdminDemoConfig: SchoolAdminDemoConfig = {
  slug: "family-lyceum",
  logo: FAMILY_LYCEUM_ADMIN_LOGO,
  colors: FAMILY_LYCEUM_ADMIN_COLORS,
  compactRows: FAMILY_LYCEUM_ADMIN_COMPACT_ROWS,
  copy: {
    schoolName: "Family Lyceum",
    schoolShortName: "Family Lyceum",
    officeName: "Family Lyceum Office",
    locationSubtitle:
      "Family Lyceum — Clearfield, UT · Hybrid Private School",
  },
  contentOverrides: familyLyceumAdminContentOverrides,
};
