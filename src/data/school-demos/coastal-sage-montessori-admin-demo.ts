/** Shared Coastal Sage Montessori logo — used everywhere branding appears in the demo. */
export const COASTAL_SAGE_MONTESSORI_LOGO = {
  src: "/images/demo/coastalsagemontessori/logo.png",
  alt: "Coastal Sage Montessori",
  width: 170,
  height: 48,
} as const;

export const COASTAL_SAGE_MONTESSORI_ADMIN_LOGO = COASTAL_SAGE_MONTESSORI_LOGO;

export const COASTAL_SAGE_MONTESSORI_ADMIN_COMPACT_ROWS = 5;

export const COASTAL_SAGE_MONTESSORI_ADMIN_COLORS = {
  bg: "#f6f8f6",
  border: "#E1E8E2",
  borderStrong: "#1F3856",
  accent: "#1F3856",
  accentBright: "#2E4D72",
  accentLight: "rgba(31, 56, 86, 0.10)",
  secondaryBtnBorder: "rgba(31, 56, 86, 0.22)",
  accentGlow: "rgba(31, 56, 86, 0.12)",
  accentMid: "#1F3856",
  accentDark: "#14263D",
  clay: "#779D7E",
  clayBg: "rgba(119, 157, 126, 0.14)",
  clayBorder: "rgba(119, 157, 126, 0.38)",
  textPrimary: "#17222E",
  textSecondary: "#56625E",
} as const;

import { adminContentOverrides as coastalSageMontessoriAdminContentOverrides } from "./admin-content/coastal-sage-montessori";
import type { SchoolAdminDemoConfig } from "./demo-dashboard-types";

export const coastalSageMontessoriAdminDemoConfig: SchoolAdminDemoConfig = {
  slug: "coastal-sage-montessori",
  logo: COASTAL_SAGE_MONTESSORI_ADMIN_LOGO,
  colors: COASTAL_SAGE_MONTESSORI_ADMIN_COLORS,
  compactRows: COASTAL_SAGE_MONTESSORI_ADMIN_COMPACT_ROWS,
  copy: {
    schoolName: "Coastal Sage Montessori",
    schoolShortName: "Coastal Sage",
    officeName: "Coastal Sage Montessori Office",
    locationSubtitle: "Carlsbad, California · Christ-centered Montessori, ages 3–15",
  },
  contentOverrides: coastalSageMontessoriAdminContentOverrides,
};
