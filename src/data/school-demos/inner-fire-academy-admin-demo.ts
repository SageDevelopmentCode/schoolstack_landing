/** Shared Inner Fire Academy logo — used everywhere branding appears in the demo. */
export const INNER_FIRE_ACADEMY_LOGO = {
  src: "/images/demo/innerfireacademy/logo.png",
  alt: "Inner Fire Academy",
  width: 180,
  height: 25,
} as const;

export const INNER_FIRE_ACADEMY_ADMIN_LOGO = INNER_FIRE_ACADEMY_LOGO;

export const INNER_FIRE_ACADEMY_ADMIN_COMPACT_ROWS = 5;

export const INNER_FIRE_ACADEMY_ADMIN_COLORS = {
  bg: "#fbfaf2",
  border: "#E2DFC8",
  borderStrong: "#222222",
  accent: "#222222",
  accentBright: "#3A3A3A",
  accentLight: "rgba(34, 34, 34, 0.08)",
  secondaryBtnBorder: "rgba(34, 34, 34, 0.22)",
  accentGlow: "rgba(34, 34, 34, 0.10)",
  accentMid: "#222222",
  accentDark: "#111111",
  clay: "#F5E663",
  clayBg: "rgba(245, 230, 99, 0.22)",
  clayBorder: "rgba(245, 230, 99, 0.55)",
  textPrimary: "#15212E",
  textSecondary: "#556170",
} as const;

import { adminContentOverrides as innerFireAcademyAdminContentOverrides } from "./admin-content/inner-fire-academy";
import type { SchoolAdminDemoConfig } from "./demo-dashboard-types";

export const innerFireAcademyAdminDemoConfig: SchoolAdminDemoConfig = {
  slug: "inner-fire-academy",
  logo: INNER_FIRE_ACADEMY_ADMIN_LOGO,
  colors: INNER_FIRE_ACADEMY_ADMIN_COLORS,
  compactRows: INNER_FIRE_ACADEMY_ADMIN_COMPACT_ROWS,
  copy: {
    schoolName: "Inner Fire Academy",
    schoolShortName: "Inner Fire",
    officeName: "Inner Fire Office",
    locationSubtitle: "San Francisco · Gifted and 2e microschool",
  },
  contentOverrides: innerFireAcademyAdminContentOverrides,
};
