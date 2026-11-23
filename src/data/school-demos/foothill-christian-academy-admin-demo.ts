/** Shared Foothill Christian Academy logo — used everywhere branding appears in the demo. */
export const FOOTHILL_CHRISTIAN_ACADEMY_LOGO = {
  src: "/images/demo/foothillchristianacademy/logo.png",
  alt: "Foothill Christian Academy seal",
  width: 56,
  height: 56,
} as const;

export const FOOTHILL_CHRISTIAN_ACADEMY_ADMIN_LOGO = FOOTHILL_CHRISTIAN_ACADEMY_LOGO;

export const FOOTHILL_CHRISTIAN_ACADEMY_ADMIN_COMPACT_ROWS = 5;

export const FOOTHILL_CHRISTIAN_ACADEMY_ADMIN_COLORS = {
  bg: "#f5f7fa",
  border: "#D8DFE9",
  borderStrong: "#1E3556",
  accent: "#1E3556",
  accentBright: "#2C4A73",
  accentLight: "rgba(30, 53, 86, 0.10)",
  secondaryBtnBorder: "rgba(30, 53, 86, 0.22)",
  accentGlow: "rgba(30, 53, 86, 0.12)",
  accentMid: "#1E3556",
  accentDark: "#13233A",
  clay: "#B8863A",
  clayBg: "rgba(184, 134, 58, 0.16)",
  clayBorder: "rgba(184, 134, 58, 0.40)",
  textPrimary: "#15212E",
  textSecondary: "#556170",
} as const;

import { adminContentOverrides as foothillChristianAcademyAdminContentOverrides } from "./admin-content/foothill-christian-academy";
import type { SchoolAdminDemoConfig } from "./demo-dashboard-types";

export const foothillChristianAcademyAdminDemoConfig: SchoolAdminDemoConfig = {
  slug: "foothill-christian-academy",
  logo: FOOTHILL_CHRISTIAN_ACADEMY_ADMIN_LOGO,
  colors: FOOTHILL_CHRISTIAN_ACADEMY_ADMIN_COLORS,
  compactRows: FOOTHILL_CHRISTIAN_ACADEMY_ADMIN_COMPACT_ROWS,
  copy: {
    schoolName: "Foothill Christian Academy",
    schoolShortName: "FCA",
    officeName: "FCA Office",
    locationSubtitle: "Upland, California · Christian hybrid school",
  },
  contentOverrides: foothillChristianAcademyAdminContentOverrides,
};
