/** Shared True North logo — use everywhere branding appears in the demo. */
export const TRUE_NORTH_ADMIN_LOGO = {
  src: "/images/demo/truenorth/scan-oct-19-2022-at-5-41-pm.jpeg",
  alt: "True North",
  width: 220,
  height: 56,
  logoOnDarkClassName: "brightness-0 invert",
} as const;

export const TRUE_NORTH_ADMIN_COMPACT_ROWS = 5;

export const TRUE_NORTH_ADMIN_COLORS = {
  bg: "#F8F8F8",
  border: "#E3E5E7",
  borderStrong: "#CED0D2",
  accent: "#254EDB",
  accentBright: "#3B6FE8",
  accentLight: "rgba(37, 78, 219, 0.10)",
  secondaryBtnBorder: "rgba(37, 78, 219, 0.22)",
  accentGlow: "rgba(37, 78, 219, 0.12)",
  accentMid: "#3B6FE8",
  accentDark: "#1D3FB0",
  clay: "#9BA0A3",
  clayBg: "rgba(155, 160, 163, 0.12)",
  clayBorder: "rgba(155, 160, 163, 0.30)",
  textPrimary: "#222222",
  textSecondary: "#6B7280",
} as const;

import { adminContentOverrides as trueNorthAdminContentOverrides } from "./admin-content/true-north";

import type { SchoolAdminDemoConfig } from "./demo-dashboard-types";

export const trueNorthAdminDemoConfig: SchoolAdminDemoConfig = {
  slug: "true-north",
  logo: TRUE_NORTH_ADMIN_LOGO,
  colors: TRUE_NORTH_ADMIN_COLORS,
  compactRows: TRUE_NORTH_ADMIN_COMPACT_ROWS,
  copy: {
    schoolName: "True North",
    schoolShortName: "True North",
    officeName: "True North Office",
    locationSubtitle: "Mud Kitchen School — Spring / Lower School",
  },
  contentOverrides: trueNorthAdminContentOverrides,
};
