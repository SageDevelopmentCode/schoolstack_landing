/** Shared Desert Dragon logo — used everywhere branding appears in the demo. */
export const DESERT_DRAGON_SCHOOL_LOGO = {
  src: "/images/demo/desertdragonschool/logo.png",
  alt: "Desert Dragon Learning Community logo",
  width: 55,
  height: 56,
} as const;

export const DESERT_DRAGON_SCHOOL_ADMIN_LOGO = DESERT_DRAGON_SCHOOL_LOGO;

export const DESERT_DRAGON_SCHOOL_ADMIN_COMPACT_ROWS = 5;

export const DESERT_DRAGON_SCHOOL_ADMIN_COLORS = {
  bg: "#f5f7fa",
  border: "#D3DDEA",
  borderStrong: "#28517F",
  accent: "#28517F",
  accentBright: "#336499",
  accentLight: "rgba(40, 81, 127, 0.10)",
  secondaryBtnBorder: "rgba(40, 81, 127, 0.22)",
  accentGlow: "rgba(40, 81, 127, 0.12)",
  accentMid: "#28517F",
  accentDark: "#1B3A5E",
  clay: "#D9822B",
  clayBg: "rgba(217, 130, 43, 0.16)",
  clayBorder: "rgba(217, 130, 43, 0.40)",
  textPrimary: "#15212E",
  textSecondary: "#556170",
} as const;

import { adminContentOverrides as desertDragonSchoolAdminContentOverrides } from "./admin-content/desert-dragon-school";
import type { SchoolAdminDemoConfig } from "./demo-dashboard-types";

export const desertDragonSchoolAdminDemoConfig: SchoolAdminDemoConfig = {
  slug: "desert-dragon-school",
  logo: DESERT_DRAGON_SCHOOL_ADMIN_LOGO,
  colors: DESERT_DRAGON_SCHOOL_ADMIN_COLORS,
  compactRows: DESERT_DRAGON_SCHOOL_ADMIN_COMPACT_ROWS,
  copy: {
    schoolName: "Desert Dragon Learning Community",
    schoolShortName: "Desert Dragon",
    officeName: "Desert Dragon Office",
    locationSubtitle: "Tucson, Arizona · Neuroaffirming microschool, K–8",
  },
  contentOverrides: desertDragonSchoolAdminContentOverrides,
};
