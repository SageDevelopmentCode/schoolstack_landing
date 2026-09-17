/** Shared Little Sprigs of Tampa logo — text wordmark used everywhere branding appears in the demo. */
export const LITTLE_SPRIGS_TAMPA_LOGO = {
  src: "",
  alt: "Little Sprigs of Tampa",
  text: "Little Sprigs of Tampa",
  textClassName:
    "font-heading text-base sm:text-lg font-semibold tracking-tight",
} as const;

export const LITTLE_SPRIGS_TAMPA_ADMIN_LOGO = LITTLE_SPRIGS_TAMPA_LOGO;

export const LITTLE_SPRIGS_TAMPA_ADMIN_COMPACT_ROWS = 5;

export const LITTLE_SPRIGS_TAMPA_ADMIN_COLORS = {
  bg: "#F7F1E5",
  border: "#E9DFCB",
  borderStrong: "#254B3D",
  accent: "#254B3D",
  accentBright: "#1A3A2F",
  accentLight: "rgba(37, 75, 61, 0.10)",
  secondaryBtnBorder: "rgba(37, 75, 61, 0.22)",
  accentGlow: "rgba(37, 75, 61, 0.12)",
  accentMid: "#1A3A2F",
  accentDark: "#1A3A2F",
  clay: "#B96645",
  clayBg: "rgba(185, 102, 69, 0.12)",
  clayBorder: "rgba(185, 102, 69, 0.35)",
  textPrimary: "#302B25",
  textSecondary: "#6E7D44",
} as const;

import { adminContentOverrides as littleSprigsTampaAdminContentOverrides } from "./admin-content/little-sprigs-tampa";

import type { SchoolAdminDemoConfig } from "./demo-dashboard-types";

export const littleSprigsTampaAdminDemoConfig: SchoolAdminDemoConfig = {
  slug: "little-sprigs-tampa",
  logo: LITTLE_SPRIGS_TAMPA_ADMIN_LOGO,
  colors: LITTLE_SPRIGS_TAMPA_ADMIN_COLORS,
  compactRows: LITTLE_SPRIGS_TAMPA_ADMIN_COMPACT_ROWS,
  copy: {
    schoolName: "Little Sprigs of Tampa",
    schoolShortName: "Little Sprigs",
    officeName: "The Homeschool Village Office",
    locationSubtitle:
      "Little Sprigs of Tampa — Tampa Bay · Temple Terrace area",
  },
  contentOverrides: littleSprigsTampaAdminContentOverrides,
};
