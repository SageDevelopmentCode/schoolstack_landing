/** Shared ESTEAM Academy logo — used everywhere branding appears in the demo. */
export const ESTEAM_ACADEMY_ROUND_ROCK_LOGO = {
  src: "/images/demo/esteamacademy/logo.jpg",
  alt: "ESTEAM Academy, an Acton Academy affiliate",
  width: 80,
  height: 50,
} as const;

export const ESTEAM_ACADEMY_ROUND_ROCK_ADMIN_LOGO = ESTEAM_ACADEMY_ROUND_ROCK_LOGO;

export const ESTEAM_ACADEMY_ROUND_ROCK_ADMIN_COMPACT_ROWS = 5;

export const ESTEAM_ACADEMY_ROUND_ROCK_ADMIN_COLORS = {
  bg: "#f5f8fb",
  border: "#D3DCE6",
  borderStrong: "#142E50",
  accent: "#142E50",
  accentBright: "#21436F",
  accentLight: "rgba(20, 46, 80, 0.10)",
  secondaryBtnBorder: "rgba(20, 46, 80, 0.22)",
  accentGlow: "rgba(20, 46, 80, 0.12)",
  accentMid: "#142E50",
  accentDark: "#0C1F38",
  clay: "#6EC1E4",
  clayBg: "rgba(110, 193, 228, 0.16)",
  clayBorder: "rgba(110, 193, 228, 0.40)",
  textPrimary: "#15212E",
  textSecondary: "#556170",
} as const;

import { adminContentOverrides as esteamAcademyRoundRockAdminContentOverrides } from "./admin-content/esteam-academy-round-rock";
import type { SchoolAdminDemoConfig } from "./demo-dashboard-types";

export const esteamAcademyRoundRockAdminDemoConfig: SchoolAdminDemoConfig = {
  slug: "esteam-academy-round-rock",
  logo: ESTEAM_ACADEMY_ROUND_ROCK_ADMIN_LOGO,
  colors: ESTEAM_ACADEMY_ROUND_ROCK_ADMIN_COLORS,
  compactRows: ESTEAM_ACADEMY_ROUND_ROCK_ADMIN_COMPACT_ROWS,
  copy: {
    schoolName: "ESTEAM Academy",
    schoolShortName: "ESTEAM",
    officeName: "ESTEAM Office",
    locationSubtitle: "Round Rock, Texas · An Acton Academy affiliate",
  },
  contentOverrides: esteamAcademyRoundRockAdminContentOverrides,
};
