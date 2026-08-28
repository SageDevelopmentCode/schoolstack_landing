/** Shared Wild Hearts Adventure Co. logo — used everywhere branding appears in the demo. */
export const WILD_HEARTS_ADVENTURE_LOGO = {
  src: "/images/demo/wildheartsadventure/logo.avif",
  alt: "Wild Hearts Adventure Co.",
  width: 180,
  height: 52,
} as const;

export const WILD_HEARTS_ADMIN_LOGO = WILD_HEARTS_ADVENTURE_LOGO;

export const WILD_HEARTS_ADMIN_COMPACT_ROWS = 5;

export const WILD_HEARTS_ADMIN_COLORS = {
  bg: "#F0F3F6",
  border: "#D4DCE4",
  borderStrong: "#8CA4B8",
  accent: "#1A2E4C",
  accentBright: "#8CA4B8",
  accentLight: "rgba(26, 46, 76, 0.08)",
  secondaryBtnBorder: "rgba(26, 46, 76, 0.22)",
  accentGlow: "rgba(255, 217, 148, 0.15)",
  accentMid: "#8CA4B8",
  accentDark: "#121D33",
  clay: "#FFD994",
  clayBg: "rgba(255, 217, 148, 0.15)",
  clayBorder: "rgba(255, 217, 148, 0.35)",
  textPrimary: "#121D33",
  textSecondary: "#5A6B7D",
} as const;

import { adminContentOverrides as wildHeartsAdventureAdminContentOverrides } from "./admin-content/wild-hearts-adventure";

import type { SchoolAdminDemoConfig } from "./demo-dashboard-types";

export const wildHeartsAdventureAdminDemoConfig: SchoolAdminDemoConfig = {
  slug: "wild-hearts-adventure",
  logo: WILD_HEARTS_ADMIN_LOGO,
  colors: WILD_HEARTS_ADMIN_COLORS,
  compactRows: WILD_HEARTS_ADMIN_COMPACT_ROWS,
  copy: {
    schoolName: "Wild Hearts Adventure Co.",
    schoolShortName: "Wild Hearts",
    officeName: "Wild Hearts Adventure Co. Office",
    locationSubtitle: "Wild Hearts Adventure Co. — Spring / Summer Adventures",
  },
  contentOverrides: wildHeartsAdventureAdminContentOverrides,
};
