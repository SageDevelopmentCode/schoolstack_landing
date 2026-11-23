/** Shared Desert Sun Ranch logo — used everywhere branding appears in the demo. */
export const DESERT_SUN_RANCH_ACADEMY_LOGO = {
  src: "/images/demo/desertsunranchacademy/logo.png",
  alt: "Desert Sun Ranch Academy logo",
  width: 52,
  height: 56,
} as const;

export const DESERT_SUN_RANCH_ACADEMY_ADMIN_LOGO = DESERT_SUN_RANCH_ACADEMY_LOGO;

export const DESERT_SUN_RANCH_ACADEMY_ADMIN_COMPACT_ROWS = 5;

export const DESERT_SUN_RANCH_ACADEMY_ADMIN_COLORS = {
  bg: "#f6f8f4",
  border: "#D8E3D2",
  borderStrong: "#2F6E3B",
  accent: "#2F6E3B",
  accentBright: "#3B8549",
  accentLight: "rgba(47, 110, 59, 0.10)",
  secondaryBtnBorder: "rgba(47, 110, 59, 0.22)",
  accentGlow: "rgba(47, 110, 59, 0.12)",
  accentMid: "#2F6E3B",
  accentDark: "#1F4D28",
  clay: "#E07B1A",
  clayBg: "rgba(224, 123, 26, 0.16)",
  clayBorder: "rgba(224, 123, 26, 0.40)",
  textPrimary: "#15212E",
  textSecondary: "#556170",
} as const;

import { adminContentOverrides as desertSunRanchAcademyAdminContentOverrides } from "./admin-content/desert-sun-ranch-academy";
import type { SchoolAdminDemoConfig } from "./demo-dashboard-types";

export const desertSunRanchAcademyAdminDemoConfig: SchoolAdminDemoConfig = {
  slug: "desert-sun-ranch-academy",
  logo: DESERT_SUN_RANCH_ACADEMY_ADMIN_LOGO,
  colors: DESERT_SUN_RANCH_ACADEMY_ADMIN_COLORS,
  compactRows: DESERT_SUN_RANCH_ACADEMY_ADMIN_COMPACT_ROWS,
  copy: {
    schoolName: "Desert Sun Ranch Academy",
    schoolShortName: "Desert Sun Ranch",
    officeName: "Desert Sun Ranch Office",
    locationSubtitle: "Queen Creek, Arizona · K–8 learning center, special needs focus",
  },
  contentOverrides: desertSunRanchAcademyAdminContentOverrides,
};
