/** Shared Peninsular Prep logo — used everywhere branding appears in the demo. */
export const PENINSULAR_PREP_LOGO = {
  src: "/images/demo/peninsularprep/logo.webp",
  alt: "Peninsular Prep sun and wave logo",
  width: 56,
  height: 56,
} as const;

export const PENINSULAR_PREP_ADMIN_LOGO = PENINSULAR_PREP_LOGO;

export const PENINSULAR_PREP_ADMIN_COMPACT_ROWS = 5;

export const PENINSULAR_PREP_ADMIN_COLORS = {
  bg: "#f7f6ee",
  border: "#D9DCE6",
  borderStrong: "#29457D",
  accent: "#29457D",
  accentBright: "#365A9C",
  accentLight: "rgba(41, 69, 125, 0.10)",
  secondaryBtnBorder: "rgba(41, 69, 125, 0.22)",
  accentGlow: "rgba(41, 69, 125, 0.12)",
  accentMid: "#29457D",
  accentDark: "#1C2F57",
  clay: "#F2B84B",
  clayBg: "rgba(242, 184, 75, 0.14)",
  clayBorder: "rgba(242, 184, 75, 0.38)",
  textPrimary: "#15212E",
  textSecondary: "#556170",
} as const;

import { adminContentOverrides as peninsularPrepAdminContentOverrides } from "./admin-content/peninsular-prep";
import type { SchoolAdminDemoConfig } from "./demo-dashboard-types";

export const peninsularPrepAdminDemoConfig: SchoolAdminDemoConfig = {
  slug: "peninsular-prep",
  logo: PENINSULAR_PREP_ADMIN_LOGO,
  colors: PENINSULAR_PREP_ADMIN_COLORS,
  compactRows: PENINSULAR_PREP_ADMIN_COMPACT_ROWS,
  copy: {
    schoolName: "Peninsular Prep",
    schoolShortName: "Pen Prep",
    officeName: "Pen Prep Front Office",
    locationSubtitle: "South Tampa, Florida · K–8",
  },
  contentOverrides: peninsularPrepAdminContentOverrides,
};
