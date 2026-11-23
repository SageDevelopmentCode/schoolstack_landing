/** Shared Sage Montessori School of Nashville logo — used everywhere branding appears in the demo. */
export const SAGE_MONTESSORI_NASHVILLE_LOGO = {
  src: "/images/demo/sagemontessorinashville/logo.png",
  alt: "Sage Montessori School of Nashville logo",
  width: 64,
  height: 50,
} as const;

export const SAGE_MONTESSORI_NASHVILLE_ADMIN_LOGO = SAGE_MONTESSORI_NASHVILLE_LOGO;

export const SAGE_MONTESSORI_NASHVILLE_ADMIN_COMPACT_ROWS = 5;

export const SAGE_MONTESSORI_NASHVILLE_ADMIN_COLORS = {
  bg: "#f7f6f2",
  border: "#DAD6CC",
  borderStrong: "#553F71",
  accent: "#553F71",
  accentBright: "#6A5089",
  accentLight: "rgba(85, 63, 113, 0.10)",
  secondaryBtnBorder: "rgba(85, 63, 113, 0.22)",
  accentGlow: "rgba(85, 63, 113, 0.12)",
  accentMid: "#553F71",
  accentDark: "#3E2D54",
  clay: "#7E9A5A",
  clayBg: "rgba(126, 154, 90, 0.14)",
  clayBorder: "rgba(126, 154, 90, 0.38)",
  textPrimary: "#15212E",
  textSecondary: "#556170",
} as const;

import { adminContentOverrides as sageMontessoriNashvilleAdminContentOverrides } from "./admin-content/sage-montessori-nashville";
import type { SchoolAdminDemoConfig } from "./demo-dashboard-types";

export const sageMontessoriNashvilleAdminDemoConfig: SchoolAdminDemoConfig = {
  slug: "sage-montessori-nashville",
  logo: SAGE_MONTESSORI_NASHVILLE_ADMIN_LOGO,
  colors: SAGE_MONTESSORI_NASHVILLE_ADMIN_COLORS,
  compactRows: SAGE_MONTESSORI_NASHVILLE_ADMIN_COMPACT_ROWS,
  copy: {
    schoolName: "Sage Montessori School of Nashville",
    schoolShortName: "Sage Montessori",
    officeName: "Sage Montessori Office",
    locationSubtitle: "Downtown Nashville · A Wildflower School",
  },
  contentOverrides: sageMontessoriNashvilleAdminContentOverrides,
};
