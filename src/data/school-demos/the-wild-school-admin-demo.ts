/** Shared The Wild School logo — used everywhere branding appears in the demo. */
export const THE_WILD_SCHOOL_LOGO = {
  src: "/images/demo/thewildschool/logo.png",
  alt: "The Wild School",
  width: 140,
  height: 50,
} as const;

export const THE_WILD_SCHOOL_ADMIN_LOGO = THE_WILD_SCHOOL_LOGO;

export const THE_WILD_SCHOOL_ADMIN_COMPACT_ROWS = 5;

export const THE_WILD_SCHOOL_ADMIN_COLORS = {
  bg: "#f8f6ee",
  border: "#DCD8C4",
  borderStrong: "#3E5A3A",
  accent: "#3E5A3A",
  accentBright: "#4D6E48",
  accentLight: "rgba(62, 90, 58, 0.10)",
  secondaryBtnBorder: "rgba(62, 90, 58, 0.22)",
  accentGlow: "rgba(62, 90, 58, 0.12)",
  accentMid: "#3E5A3A",
  accentDark: "#2C412A",
  clay: "#E1C44F",
  clayBg: "rgba(225, 196, 79, 0.16)",
  clayBorder: "rgba(225, 196, 79, 0.40)",
  textPrimary: "#15212E",
  textSecondary: "#556170",
} as const;

import { adminContentOverrides as theWildSchoolAdminContentOverrides } from "./admin-content/the-wild-school";
import type { SchoolAdminDemoConfig } from "./demo-dashboard-types";

export const theWildSchoolAdminDemoConfig: SchoolAdminDemoConfig = {
  slug: "the-wild-school",
  logo: THE_WILD_SCHOOL_ADMIN_LOGO,
  colors: THE_WILD_SCHOOL_ADMIN_COLORS,
  compactRows: THE_WILD_SCHOOL_ADMIN_COMPACT_ROWS,
  copy: {
    schoolName: "The Wild School",
    schoolShortName: "The Wild School",
    officeName: "Wild School Family Experience",
    locationSubtitle: "Houston, Texas · Fully outdoor nature school",
  },
  contentOverrides: theWildSchoolAdminContentOverrides,
};
