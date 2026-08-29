/** Shared Kat's Community Microschool logo — used everywhere branding appears in the demo. */
export const KATS_COMMUNITY_MICROSCHOOL_LOGO = {
  src: "/images/demo/katscommunity/logo.png",
  alt: "Kat's Community Microschool",
  width: 72,
  height: 72,
} as const;

export const KATS_COMMUNITY_MICROSCHOOL_ADMIN_LOGO = KATS_COMMUNITY_MICROSCHOOL_LOGO;

export const KATS_COMMUNITY_MICROSCHOOL_ADMIN_COMPACT_ROWS = 5;

export const KATS_COMMUNITY_MICROSCHOOL_ADMIN_COLORS = {
  bg: "#FBF5E9",
  border: "#DCD6C8",
  borderStrong: "#285943",
  accent: "#285943",
  accentBright: "#1f4535",
  accentLight: "rgba(40, 89, 67, 0.10)",
  secondaryBtnBorder: "rgba(40, 89, 67, 0.22)",
  accentGlow: "rgba(40, 89, 67, 0.12)",
  accentMid: "#1F2A2E",
  accentDark: "#1a2326",
  clay: "#F2BC4B",
  clayBg: "rgba(242, 188, 75, 0.12)",
  clayBorder: "rgba(242, 188, 75, 0.35)",
  textPrimary: "#1F2A2E",
  textSecondary: "#647174",
} as const;

import { adminContentOverrides as katsCommunityMicroschoolAdminContentOverrides } from "./admin-content/kats-community-microschool";

import type { SchoolAdminDemoConfig } from "./demo-dashboard-types";

export const katsCommunityMicroschoolAdminDemoConfig: SchoolAdminDemoConfig = {
  slug: "kats-community-microschool",
  logo: KATS_COMMUNITY_MICROSCHOOL_ADMIN_LOGO,
  colors: KATS_COMMUNITY_MICROSCHOOL_ADMIN_COLORS,
  compactRows: KATS_COMMUNITY_MICROSCHOOL_ADMIN_COMPACT_ROWS,
  copy: {
    schoolName: "Kat's Community Microschool",
    schoolShortName: "Kat's Community",
    officeName: "Kat's Community Microschool Office",
    locationSubtitle: "Kat's Community Microschool — Phoenix, AZ · 2026–27 Enrollment",
  },
  contentOverrides: katsCommunityMicroschoolAdminContentOverrides,
};
