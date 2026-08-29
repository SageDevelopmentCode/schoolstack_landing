/** Shared Wondering Oaks Learning logo — text wordmark used everywhere branding appears in the demo. */
export const WONDERING_OAKS_LOGO = {
  src: "",
  alt: "Wondering Oaks Learning",
  text: "Wondering Oaks Learning",
  textClassName:
    "font-heading text-base sm:text-lg font-semibold leading-tight tracking-tight",
} as const;

export const WONDERING_OAKS_ADMIN_LOGO = WONDERING_OAKS_LOGO;

export const WONDERING_OAKS_ADMIN_COMPACT_ROWS = 5;

export const WONDERING_OAKS_ADMIN_COLORS = {
  bg: "#FBF8F3",
  border: "#E8DDD2",
  borderStrong: "#D4C9B5",
  accent: "#15843C",
  accentBright: "#60D888",
  accentLight: "rgba(21, 132, 60, 0.10)",
  secondaryBtnBorder: "rgba(21, 132, 60, 0.22)",
  accentGlow: "rgba(245, 166, 141, 0.12)",
  accentMid: "#8B6B4A",
  accentDark: "#0E5828",
  clay: "#F5A68D",
  clayBg: "rgba(245, 166, 141, 0.12)",
  clayBorder: "rgba(245, 166, 141, 0.30)",
  textPrimary: "#2B241F",
  textSecondary: "#5F6360",
} as const;

import { adminContentOverrides as wonderingOaksLearningAdminContentOverrides } from "./admin-content/wondering-oaks-learning";

import type { SchoolAdminDemoConfig } from "./demo-dashboard-types";

export const wonderingOaksLearningAdminDemoConfig: SchoolAdminDemoConfig = {
  slug: "wondering-oaks-learning",
  logo: WONDERING_OAKS_ADMIN_LOGO,
  colors: WONDERING_OAKS_ADMIN_COLORS,
  compactRows: WONDERING_OAKS_ADMIN_COMPACT_ROWS,
  copy: {
    schoolName: "Wondering Oaks Learning",
    schoolShortName: "Wondering Oaks",
    officeName: "Wondering Oaks Learning Office",
    locationSubtitle: "Mud Kitchen School — Spring / Summer 2026",
  },
  contentOverrides: wonderingOaksLearningAdminContentOverrides,
};
