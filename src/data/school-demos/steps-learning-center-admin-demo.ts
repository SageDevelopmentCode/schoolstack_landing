/** Shared Steps Learning Center logo — used everywhere branding appears in the demo. */
export const STEPS_LEARNING_CENTER_LOGO = {
  src: "/images/demo/stepslearningcenter/logo.png",
  alt: "Steps Learning Center logo with footprints",
  width: 56,
  height: 56,
} as const;

export const STEPS_LEARNING_CENTER_ADMIN_LOGO = STEPS_LEARNING_CENTER_LOGO;

export const STEPS_LEARNING_CENTER_ADMIN_COMPACT_ROWS = 5;

export const STEPS_LEARNING_CENTER_ADMIN_COLORS = {
  bg: "#f7f6f9",
  border: "#DCD8E6",
  borderStrong: "#3B2F7A",
  accent: "#3B2F7A",
  accentBright: "#4E4196",
  accentLight: "rgba(59, 47, 122, 0.10)",
  secondaryBtnBorder: "rgba(59, 47, 122, 0.22)",
  accentGlow: "rgba(59, 47, 122, 0.12)",
  accentMid: "#3B2F7A",
  accentDark: "#271E57",
  clay: "#E98A2C",
  clayBg: "rgba(233, 138, 44, 0.14)",
  clayBorder: "rgba(233, 138, 44, 0.38)",
  textPrimary: "#15212E",
  textSecondary: "#556170",
} as const;

import { adminContentOverrides as stepsLearningCenterAdminContentOverrides } from "./admin-content/steps-learning-center";
import type { SchoolAdminDemoConfig } from "./demo-dashboard-types";

export const stepsLearningCenterAdminDemoConfig: SchoolAdminDemoConfig = {
  slug: "steps-learning-center",
  logo: STEPS_LEARNING_CENTER_ADMIN_LOGO,
  colors: STEPS_LEARNING_CENTER_ADMIN_COLORS,
  compactRows: STEPS_LEARNING_CENTER_ADMIN_COMPACT_ROWS,
  copy: {
    schoolName: "Steps Learning Center",
    schoolShortName: "Steps",
    officeName: "Steps Office",
    locationSubtitle: "Orlando, Florida · Support for neurodiverse learners",
  },
  contentOverrides: stepsLearningCenterAdminContentOverrides,
};
