/** Shared Lab Learning Space logo — use everywhere branding appears in the demo. */
export const LAB_LEARNING_ADMIN_LOGO = {
  src: "/images/demo/lablearningspace/lab%20logo%20re-imagined.avif",
  alt: "The Lab Learning Space",
  width: 200,
  height: 56,
} as const;

export const LAB_LEARNING_ADMIN_COMPACT_ROWS = 5;

export const LAB_LEARNING_ADMIN_COLORS = {
  bg: "#ffffff",
  border: "#ddd7cf",
  borderStrong: "#c9c0b5",
  accent: "#6f8f3a",
  accentBright: "#7fa34a",
  accentLight: "rgba(111, 143, 58, 0.10)",
  secondaryBtnBorder: "rgba(111, 143, 58, 0.22)",
  accentGlow: "rgba(111, 143, 58, 0.12)",
  accentMid: "#3d6b8d",
  accentDark: "#5a7530",
  clay: "#d7a64a",
  clayBg: "rgba(215, 166, 74, 0.12)",
  clayBorder: "rgba(215, 166, 74, 0.30)",
  textPrimary: "#1f1f1f",
  textSecondary: "#6f6f6f",
} as const;

import { adminContentOverrides as labLearningAdminContentOverrides } from "./admin-content/lab-learning";

import type { SchoolAdminDemoConfig } from "./demo-dashboard-types";

export const labLearningAdminDemoConfig: SchoolAdminDemoConfig = {
  slug: "lab-learning",
  logo: LAB_LEARNING_ADMIN_LOGO,
  colors: LAB_LEARNING_ADMIN_COLORS,
  compactRows: LAB_LEARNING_ADMIN_COMPACT_ROWS,
  copy: {
    schoolName: "The Lab Learning Space",
    schoolShortName: "The Lab",
    officeName: "The Lab Learning Space Office",
    locationSubtitle: "Mud Kitchen School — Spring / Summer 2026",
  },
  contentOverrides: labLearningAdminContentOverrides,
};
