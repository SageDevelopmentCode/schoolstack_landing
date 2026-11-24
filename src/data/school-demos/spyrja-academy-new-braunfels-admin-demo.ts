/** Shared Spyrja Academy logo — used everywhere branding appears in the demo. */
export const SPYRJA_ACADEMY_NEW_BRAUNFELS_LOGO = {
  src: "/images/demo/spyrjaacademynewbraunfels/logo.png",
  alt: "Spyrja Academy logo",
  width: 56,
  height: 56,
} as const;

export const SPYRJA_ACADEMY_NEW_BRAUNFELS_ADMIN_LOGO = SPYRJA_ACADEMY_NEW_BRAUNFELS_LOGO;

export const SPYRJA_ACADEMY_NEW_BRAUNFELS_ADMIN_COMPACT_ROWS = 5;

export const SPYRJA_ACADEMY_NEW_BRAUNFELS_ADMIN_COLORS = {
  bg: "#f4f8f8",
  border: "#CFE3E1",
  borderStrong: "#0A6966",
  accent: "#0A6966",
  accentBright: "#0D807C",
  accentLight: "rgba(10, 105, 102, 0.10)",
  secondaryBtnBorder: "rgba(10, 105, 102, 0.22)",
  accentGlow: "rgba(10, 105, 102, 0.12)",
  accentMid: "#0A6966",
  accentDark: "#064A48",
  clay: "#E6B422",
  clayBg: "rgba(230, 180, 34, 0.16)",
  clayBorder: "rgba(230, 180, 34, 0.40)",
  textPrimary: "#15212E",
  textSecondary: "#556170",
} as const;

import { adminContentOverrides as spyrjaAcademyNewBraunfelsAdminContentOverrides } from "./admin-content/spyrja-academy-new-braunfels";
import type { SchoolAdminDemoConfig } from "./demo-dashboard-types";

export const spyrjaAcademyNewBraunfelsAdminDemoConfig: SchoolAdminDemoConfig = {
  slug: "spyrja-academy-new-braunfels",
  logo: SPYRJA_ACADEMY_NEW_BRAUNFELS_ADMIN_LOGO,
  colors: SPYRJA_ACADEMY_NEW_BRAUNFELS_ADMIN_COLORS,
  compactRows: SPYRJA_ACADEMY_NEW_BRAUNFELS_ADMIN_COMPACT_ROWS,
  copy: {
    schoolName: "Spyrja Academy of New Braunfels",
    schoolShortName: "Spyrja",
    officeName: "Spyrja Office",
    locationSubtitle: "New Braunfels, Texas · Microschool, 6th–12th",
  },
  contentOverrides: spyrjaAcademyNewBraunfelsAdminContentOverrides,
};
