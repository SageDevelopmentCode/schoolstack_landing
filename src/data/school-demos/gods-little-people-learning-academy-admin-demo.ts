/** Shared God's Little People Learning Academy logo — used everywhere branding appears in the demo. */
export const GODS_LITTLE_PEOPLE_LEARNING_ACADEMY_LOGO = {
  src: "/images/demo/godslittlepeople/logo.webp",
  alt: "God's Little People Learning Academy",
  width: 54,
  height: 56,
} as const;

export const GODS_LITTLE_PEOPLE_LEARNING_ACADEMY_ADMIN_LOGO = GODS_LITTLE_PEOPLE_LEARNING_ACADEMY_LOGO;

export const GODS_LITTLE_PEOPLE_LEARNING_ACADEMY_ADMIN_COMPACT_ROWS = 5;

export const GODS_LITTLE_PEOPLE_LEARNING_ACADEMY_ADMIN_COLORS = {
  bg: "#f7f7fb",
  border: "#E4E4EF",
  borderStrong: "#3A3A8C",
  accent: "#3A3A8C",
  accentBright: "#4B4BA6",
  accentLight: "rgba(58, 58, 140, 0.10)",
  secondaryBtnBorder: "rgba(58, 58, 140, 0.22)",
  accentGlow: "rgba(58, 58, 140, 0.12)",
  accentMid: "#3A3A8C",
  accentDark: "#28286A",
  clay: "#F5C842",
  clayBg: "rgba(245, 200, 66, 0.14)",
  clayBorder: "rgba(245, 200, 66, 0.38)",
  textPrimary: "#15212E",
  textSecondary: "#556170",
} as const;

import { adminContentOverrides as godsLittlePeopleLearningAcademyAdminContentOverrides } from "./admin-content/gods-little-people-learning-academy";
import type { SchoolAdminDemoConfig } from "./demo-dashboard-types";

export const godsLittlePeopleLearningAcademyAdminDemoConfig: SchoolAdminDemoConfig = {
  slug: "gods-little-people-learning-academy",
  logo: GODS_LITTLE_PEOPLE_LEARNING_ACADEMY_ADMIN_LOGO,
  colors: GODS_LITTLE_PEOPLE_LEARNING_ACADEMY_ADMIN_COLORS,
  compactRows: GODS_LITTLE_PEOPLE_LEARNING_ACADEMY_ADMIN_COMPACT_ROWS,
  copy: {
    schoolName: "God's Little People Learning Academy",
    schoolShortName: "God's Little People",
    officeName: "God's Little People Office",
    locationSubtitle: "Houston, Texas · Faith-based microschool, Pre-K–2nd",
  },
  contentOverrides: godsLittlePeopleLearningAcademyAdminContentOverrides,
};
