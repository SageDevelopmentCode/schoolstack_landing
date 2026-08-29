/** Shared Spring River School logo — use everywhere branding appears in the demo. */
export const SPRING_RIVER_SCHOOL_ADMIN_LOGO = {
  src: "/images/demo/springriverschool/deb594_1b1fbf63cb8f4f659f238fba49f438ec~mv2.avif",
  alt: "Spring River School",
  width: 180,
  height: 52,
} as const;

export const SPRING_RIVER_SCHOOL_ADMIN_COMPACT_ROWS = 5;

export const SPRING_RIVER_SCHOOL_ADMIN_COLORS = {
  bg: "#FAF8F4",
  border: "#E5DFD3",
  borderStrong: "#D4CBB8",
  accent: "#2F3D34",
  accentBright: "#5F7360",
  accentLight: "rgba(47, 61, 52, 0.10)",
  secondaryBtnBorder: "rgba(47, 61, 52, 0.22)",
  accentGlow: "rgba(95, 115, 96, 0.12)",
  accentMid: "#4A7C6F",
  accentDark: "#243028",
  clay: "#EA492E",
  clayBg: "rgba(234, 73, 46, 0.12)",
  clayBorder: "rgba(234, 73, 46, 0.30)",
  textPrimary: "#2F3D34",
  textSecondary: "#6B6560",
} as const;

import { adminContentOverrides as springRiverSchoolAdminContentOverrides } from "./admin-content/spring-river-school";

import type { SchoolAdminDemoConfig } from "./demo-dashboard-types";

export const springRiverSchoolAdminDemoConfig: SchoolAdminDemoConfig = {
  slug: "spring-river-school",
  logo: SPRING_RIVER_SCHOOL_ADMIN_LOGO,
  colors: SPRING_RIVER_SCHOOL_ADMIN_COLORS,
  compactRows: SPRING_RIVER_SCHOOL_ADMIN_COMPACT_ROWS,
  copy: {
    schoolName: "Spring River School",
    schoolShortName: "Spring River",
    officeName: "Spring River School Office",
    locationSubtitle: "Mud Kitchen School — Spring / Summer 2026",
  },
  contentOverrides: springRiverSchoolAdminContentOverrides,
};
