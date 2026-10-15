/** Shared Inspired Learning Academy logo — used everywhere branding appears in the demo. */
export const INSPIRED_LEARNING_LOGO = {
  src: "/images/demo/inspiredlearning/ila-logo_highres.avif",
  alt: "Inspired Learning Academy",
  width: 222,
  height: 100,
} as const;

export const INSPIRED_LEARNING_ADMIN_LOGO = INSPIRED_LEARNING_LOGO;

export const INSPIRED_LEARNING_ADMIN_COMPACT_ROWS = 5;

export const INSPIRED_LEARNING_ADMIN_COLORS = {
  bg: "#F7F7F5",
  border: "#E7E5E3",
  borderStrong: "#B84032",
  accent: "#B84032",
  accentBright: "#9A3529",
  accentLight: "rgba(184, 64, 50, 0.10)",
  secondaryBtnBorder: "rgba(184, 64, 50, 0.22)",
  accentGlow: "rgba(184, 64, 50, 0.12)",
  accentMid: "#373737",
  accentDark: "#2A2A2A",
  clay: "#FC6D5D",
  clayBg: "rgba(252, 109, 93, 0.12)",
  clayBorder: "rgba(252, 109, 93, 0.35)",
  textPrimary: "#373737",
  textSecondary: "#686868",
} as const;

import { adminContentOverrides as inspiredLearningAdminContentOverrides } from "./admin-content/inspired-learning-academy";

import type { SchoolAdminDemoConfig } from "./demo-dashboard-types";

export const inspiredLearningAdminDemoConfig: SchoolAdminDemoConfig = {
  slug: "inspired-learning-academy",
  logo: INSPIRED_LEARNING_ADMIN_LOGO,
  colors: INSPIRED_LEARNING_ADMIN_COLORS,
  compactRows: INSPIRED_LEARNING_ADMIN_COMPACT_ROWS,
  copy: {
    schoolName: "Inspired Learning Academy",
    schoolShortName: "Inspired",
    officeName: "Inspired Learning Academy Office",
    locationSubtitle:
      "Inspired Learning Academy — Allen, TX · Grades 6–12 · 2026–2027",
  },
  contentOverrides: inspiredLearningAdminContentOverrides,
};
