/** Shared Prestige Wisdom Academy logo — used everywhere branding appears in the demo. */
export const PRESTIGE_WISDOM_ACADEMY_LOGO = {
  src: "/images/demo/prestigewisdomacademy/logo.jpg",
  alt: "Prestige Wisdom Academy crest",
  width: 56,
  height: 56,
} as const;

export const PRESTIGE_WISDOM_ACADEMY_ADMIN_LOGO = PRESTIGE_WISDOM_ACADEMY_LOGO;

export const PRESTIGE_WISDOM_ACADEMY_ADMIN_COMPACT_ROWS = 5;

export const PRESTIGE_WISDOM_ACADEMY_ADMIN_COLORS = {
  bg: "#fbf8f1",
  border: "#E4D9BF",
  borderStrong: "#0C1C45",
  accent: "#0C1C45",
  accentBright: "#1C3060",
  accentLight: "rgba(12, 28, 69, 0.10)",
  secondaryBtnBorder: "rgba(12, 28, 69, 0.22)",
  accentGlow: "rgba(12, 28, 69, 0.12)",
  accentMid: "#0C1C45",
  accentDark: "#030B2D",
  clay: "#D0A43A",
  clayBg: "rgba(208, 164, 58, 0.14)",
  clayBorder: "rgba(208, 164, 58, 0.38)",
  textPrimary: "#15212E",
  textSecondary: "#556170",
} as const;

import { adminContentOverrides as prestigeWisdomAcademyAdminContentOverrides } from "./admin-content/prestige-wisdom-academy";
import type { SchoolAdminDemoConfig } from "./demo-dashboard-types";

export const prestigeWisdomAcademyAdminDemoConfig: SchoolAdminDemoConfig = {
  slug: "prestige-wisdom-academy",
  logo: PRESTIGE_WISDOM_ACADEMY_ADMIN_LOGO,
  colors: PRESTIGE_WISDOM_ACADEMY_ADMIN_COLORS,
  compactRows: PRESTIGE_WISDOM_ACADEMY_ADMIN_COMPACT_ROWS,
  copy: {
    schoolName: "Prestige Wisdom Academy",
    schoolShortName: "PWA",
    officeName: "PWA Office",
    locationSubtitle: "Houston, Texas · Faith-centered microschool",
  },
  contentOverrides: prestigeWisdomAcademyAdminContentOverrides,
};
