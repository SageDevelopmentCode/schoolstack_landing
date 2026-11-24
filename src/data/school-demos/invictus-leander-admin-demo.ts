/** Shared Invictus: An Acton Academy logo — used everywhere branding appears in the demo. */
export const INVICTUS_LEANDER_LOGO = {
  src: "/images/demo/invictusleander/logo.png",
  alt: "Invictus: An Acton Academy",
  width: 58,
  height: 56,
} as const;

export const INVICTUS_LEANDER_ADMIN_LOGO = INVICTUS_LEANDER_LOGO;

export const INVICTUS_LEANDER_ADMIN_COMPACT_ROWS = 5;

export const INVICTUS_LEANDER_ADMIN_COLORS = {
  bg: "#faf7f7",
  border: "#EDE3E4",
  borderStrong: "#5E1A24",
  accent: "#5E1A24",
  accentBright: "#7A2531",
  accentLight: "rgba(94, 26, 36, 0.10)",
  secondaryBtnBorder: "rgba(94, 26, 36, 0.22)",
  accentGlow: "rgba(94, 26, 36, 0.12)",
  accentMid: "#5E1A24",
  accentDark: "#431218",
  clay: "#E3B341",
  clayBg: "rgba(227, 179, 65, 0.14)",
  clayBorder: "rgba(227, 179, 65, 0.38)",
  textPrimary: "#15212E",
  textSecondary: "#556170",
} as const;

import { adminContentOverrides as invictusLeanderAdminContentOverrides } from "./admin-content/invictus-leander";
import type { SchoolAdminDemoConfig } from "./demo-dashboard-types";

export const invictusLeanderAdminDemoConfig: SchoolAdminDemoConfig = {
  slug: "invictus-leander",
  logo: INVICTUS_LEANDER_ADMIN_LOGO,
  colors: INVICTUS_LEANDER_ADMIN_COLORS,
  compactRows: INVICTUS_LEANDER_ADMIN_COMPACT_ROWS,
  copy: {
    schoolName: "Invictus: An Acton Academy",
    schoolShortName: "Invictus",
    officeName: "Invictus Front Desk",
    locationSubtitle: "Georgetown, Texas · Learner-driven Acton Academy, ages 3.5–11",
  },
  contentOverrides: invictusLeanderAdminContentOverrides,
};
