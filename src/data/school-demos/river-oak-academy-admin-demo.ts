/** Shared River Oak Academy logo — used everywhere branding appears in the demo. */
export const RIVER_OAK_ACADEMY_LOGO = {
  src: "/images/demo/riveroakacademy/River Oak Logo (4).avif",
  alt: "River Oak Academy",
  width: 180,
  height: 56,
} as const;

export const RIVER_OAK_ACADEMY_ADMIN_LOGO = RIVER_OAK_ACADEMY_LOGO;

export const RIVER_OAK_ACADEMY_ADMIN_COMPACT_ROWS = 5;

export const RIVER_OAK_ACADEMY_ADMIN_COLORS = {
  bg: "#F5F0E5",
  border: "#E8EDE1",
  borderStrong: "#496846",
  accent: "#496846",
  accentBright: "#24372B",
  accentLight: "rgba(73, 104, 70, 0.10)",
  secondaryBtnBorder: "rgba(73, 104, 70, 0.22)",
  accentGlow: "rgba(73, 104, 70, 0.12)",
  accentMid: "#24372B",
  accentDark: "#24372B",
  clay: "#E1B654",
  clayBg: "rgba(225, 182, 84, 0.12)",
  clayBorder: "rgba(225, 182, 84, 0.35)",
  textPrimary: "#24372B",
  textSecondary: "#505650",
} as const;

import { adminContentOverrides as riverOakAcademyAdminContentOverrides } from "./admin-content/river-oak-academy";

import type { SchoolAdminDemoConfig } from "./demo-dashboard-types";

export const riverOakAcademyAdminDemoConfig: SchoolAdminDemoConfig = {
  slug: "river-oak-academy",
  logo: RIVER_OAK_ACADEMY_ADMIN_LOGO,
  colors: RIVER_OAK_ACADEMY_ADMIN_COLORS,
  compactRows: RIVER_OAK_ACADEMY_ADMIN_COMPACT_ROWS,
  copy: {
    schoolName: "River Oak Academy",
    schoolShortName: "River Oak",
    officeName: "River Oak Academy Office",
    locationSubtitle: "River Oak Academy — St. Johns, FL · Ages 4–14",
  },
  contentOverrides: riverOakAcademyAdminContentOverrides,
};
