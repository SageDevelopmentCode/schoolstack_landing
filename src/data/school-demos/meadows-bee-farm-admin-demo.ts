/** Shared Meadows Bee Farm logo — used everywhere branding appears in the demo. */
export const MEADOWS_BEE_FARM_LOGO = {
  src: "/images/demo/meadowsbeefarm/logo.png",
  alt: "Meadows Bee Farm",
  width: 90,
  height: 56,
} as const;

export const MEADOWS_BEE_FARM_ADMIN_LOGO = MEADOWS_BEE_FARM_LOGO;

export const MEADOWS_BEE_FARM_ADMIN_COMPACT_ROWS = 5;

export const MEADOWS_BEE_FARM_ADMIN_COLORS = {
  bg: "#faf8f2",
  border: "#E8DFCC",
  borderStrong: "#6E4420",
  accent: "#6E4420",
  accentBright: "#8A5A2E",
  accentLight: "rgba(110, 68, 32, 0.10)",
  secondaryBtnBorder: "rgba(110, 68, 32, 0.22)",
  accentGlow: "rgba(110, 68, 32, 0.12)",
  accentMid: "#6E4420",
  accentDark: "#4E2F14",
  clay: "#F2C12E",
  clayBg: "rgba(242, 193, 46, 0.14)",
  clayBorder: "rgba(242, 193, 46, 0.38)",
  textPrimary: "#2A2118",
  textSecondary: "#6A5F52",
} as const;

import { adminContentOverrides as meadowsBeeFarmAdminContentOverrides } from "./admin-content/meadows-bee-farm";
import type { SchoolAdminDemoConfig } from "./demo-dashboard-types";

export const meadowsBeeFarmAdminDemoConfig: SchoolAdminDemoConfig = {
  slug: "meadows-bee-farm",
  logo: MEADOWS_BEE_FARM_ADMIN_LOGO,
  colors: MEADOWS_BEE_FARM_ADMIN_COLORS,
  compactRows: MEADOWS_BEE_FARM_ADMIN_COMPACT_ROWS,
  copy: {
    schoolName: "Meadows Bee Farm",
    schoolShortName: "Meadows Bee",
    officeName: "Meadows Bee Farm Education",
    locationSubtitle: "Windham, Vermont · Young Farmers Program since 2012",
  },
  contentOverrides: meadowsBeeFarmAdminContentOverrides,
};
