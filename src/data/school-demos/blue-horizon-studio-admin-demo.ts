/** Shared Blue Horizon logo — used everywhere branding appears in the demo. */
export const BLUE_HORIZON_STUDIO_LOGO = {
  src: "/images/demo/bluehorizonstudio/logo.png",
  alt: "Blue Horizon Studio logo",
  width: 80,
  height: 56,
} as const;

export const BLUE_HORIZON_STUDIO_ADMIN_LOGO = BLUE_HORIZON_STUDIO_LOGO;

export const BLUE_HORIZON_STUDIO_ADMIN_COMPACT_ROWS = 5;

export const BLUE_HORIZON_STUDIO_ADMIN_COLORS = {
  bg: "#f4f7fb",
  border: "#D3DEEC",
  borderStrong: "#122954",
  accent: "#122954",
  accentBright: "#23407A",
  accentLight: "rgba(18, 41, 84, 0.10)",
  secondaryBtnBorder: "rgba(18, 41, 84, 0.22)",
  accentGlow: "rgba(18, 41, 84, 0.12)",
  accentMid: "#122954",
  accentDark: "#0B1B3A",
  clay: "#8DB8DE",
  clayBg: "rgba(141, 184, 222, 0.20)",
  clayBorder: "rgba(141, 184, 222, 0.45)",
  textPrimary: "#15212E",
  textSecondary: "#556170",
} as const;

import { adminContentOverrides as blueHorizonStudioAdminContentOverrides } from "./admin-content/blue-horizon-studio";
import type { SchoolAdminDemoConfig } from "./demo-dashboard-types";

export const blueHorizonStudioAdminDemoConfig: SchoolAdminDemoConfig = {
  slug: "blue-horizon-studio",
  logo: BLUE_HORIZON_STUDIO_ADMIN_LOGO,
  colors: BLUE_HORIZON_STUDIO_ADMIN_COLORS,
  compactRows: BLUE_HORIZON_STUDIO_ADMIN_COMPACT_ROWS,
  copy: {
    schoolName: "Blue Horizon Studio",
    schoolShortName: "Blue Horizon",
    officeName: "Blue Horizon Studio",
    locationSubtitle: "Lathrop/Manteca, California · Boutique microschool, grades 3–8",
  },
  contentOverrides: blueHorizonStudioAdminContentOverrides,
};
