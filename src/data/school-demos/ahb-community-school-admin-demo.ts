/** Shared AHB logo — used everywhere branding appears in the demo. */
export const AHB_COMMUNITY_SCHOOL_LOGO = {
  src: "/images/demo/ahbcommunityschool/logo.png",
  alt: "AHB Community School logo",
  width: 160,
  height: 40,
} as const;

export const AHB_COMMUNITY_SCHOOL_ADMIN_LOGO = AHB_COMMUNITY_SCHOOL_LOGO;

export const AHB_COMMUNITY_SCHOOL_ADMIN_COMPACT_ROWS = 5;

export const AHB_COMMUNITY_SCHOOL_ADMIN_COLORS = {
  bg: "#f4f8fa",
  border: "#D2E3EE",
  borderStrong: "#0076B4",
  accent: "#0076B4",
  accentBright: "#005E92",
  accentLight: "rgba(0, 118, 180, 0.10)",
  secondaryBtnBorder: "rgba(0, 118, 180, 0.22)",
  accentGlow: "rgba(0, 118, 180, 0.12)",
  accentMid: "#0076B4",
  accentDark: "#004A73",
  clay: "#B1BF35",
  clayBg: "rgba(177, 191, 53, 0.18)",
  clayBorder: "rgba(177, 191, 53, 0.45)",
  textPrimary: "#15212E",
  textSecondary: "#556170",
} as const;

import { adminContentOverrides as ahbCommunitySchoolAdminContentOverrides } from "./admin-content/ahb-community-school";
import type { SchoolAdminDemoConfig } from "./demo-dashboard-types";

export const ahbCommunitySchoolAdminDemoConfig: SchoolAdminDemoConfig = {
  slug: "ahb-community-school",
  logo: AHB_COMMUNITY_SCHOOL_ADMIN_LOGO,
  colors: AHB_COMMUNITY_SCHOOL_ADMIN_COLORS,
  compactRows: AHB_COMMUNITY_SCHOOL_ADMIN_COMPACT_ROWS,
  copy: {
    schoolName: "AHB Community School",
    schoolShortName: "AHB",
    officeName: "AHB Office",
    locationSubtitle: "Crestview, Austin · Project-based micro school, K–8",
  },
  contentOverrides: ahbCommunitySchoolAdminContentOverrides,
};
