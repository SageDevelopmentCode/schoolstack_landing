/** Shared Madrona School logo — used everywhere branding appears in the demo. */
export const MADRONA_SCHOOL_LOGO = {
  src: "/images/demo/madronaschool/logo.webp",
  alt: "Madrona School",
  width: 149,
  height: 56,
} as const;

export const MADRONA_SCHOOL_ADMIN_LOGO = MADRONA_SCHOOL_LOGO;

export const MADRONA_SCHOOL_ADMIN_COMPACT_ROWS = 5;

export const MADRONA_SCHOOL_ADMIN_COLORS = {
  bg: "#f7faf6",
  border: "#E3E9DE",
  borderStrong: "#073F2C",
  accent: "#073F2C",
  accentBright: "#14573F",
  accentLight: "rgba(7, 63, 44, 0.10)",
  secondaryBtnBorder: "rgba(7, 63, 44, 0.22)",
  accentGlow: "rgba(7, 63, 44, 0.12)",
  accentMid: "#073F2C",
  accentDark: "#042A1D",
  clay: "#9DB84F",
  clayBg: "rgba(157, 184, 79, 0.14)",
  clayBorder: "rgba(157, 184, 79, 0.38)",
  textPrimary: "#16251E",
  textSecondary: "#55655B",
} as const;

import { adminContentOverrides as madronaSchoolAdminContentOverrides } from "./admin-content/madrona-school";
import type { SchoolAdminDemoConfig } from "./demo-dashboard-types";

export const madronaSchoolAdminDemoConfig: SchoolAdminDemoConfig = {
  slug: "madrona-school",
  logo: MADRONA_SCHOOL_ADMIN_LOGO,
  colors: MADRONA_SCHOOL_ADMIN_COLORS,
  compactRows: MADRONA_SCHOOL_ADMIN_COMPACT_ROWS,
  copy: {
    schoolName: "Madrona School",
    schoolShortName: "Madrona",
    officeName: "Madrona School Office",
    locationSubtitle: "Bainbridge Island, Washington · Waldorf education since 1999",
  },
  contentOverrides: madronaSchoolAdminContentOverrides,
};
