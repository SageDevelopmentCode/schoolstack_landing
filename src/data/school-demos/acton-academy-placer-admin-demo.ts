/** Shared Acton Academy Placer logo — used everywhere branding appears in the demo. */
export const ACTON_ACADEMY_PLACER_LOGO = {
  src: "/images/demo/actonacademyplacer/OPzas7gRlabDLUunXHUuKjVWG6aG7hMKgMUVxxVw.png",
  alt: "Acton Academy Placer",
  width: 220,
  height: 40,
  logoOnDarkClassName: "brightness-0 invert",
} as const;

export const ACTON_ACADEMY_PLACER_ADMIN_LOGO = ACTON_ACADEMY_PLACER_LOGO;

export const ACTON_ACADEMY_PLACER_ADMIN_COMPACT_ROWS = 5;

export const ACTON_ACADEMY_PLACER_ADMIN_COLORS = {
  bg: "#F6F0E4",
  border: "#E4EAE2",
  borderStrong: "#183E35",
  accent: "#183E35",
  accentBright: "#102820",
  accentLight: "rgba(24, 62, 53, 0.10)",
  secondaryBtnBorder: "rgba(24, 62, 53, 0.22)",
  accentGlow: "rgba(24, 62, 53, 0.12)",
  accentMid: "#183E35",
  accentDark: "#102820",
  clay: "#E3B655",
  clayBg: "rgba(227, 182, 85, 0.14)",
  clayBorder: "rgba(227, 182, 85, 0.35)",
  textPrimary: "#1F2521",
  textSecondary: "#7A9676",
} as const;

import { adminContentOverrides as actonAcademyPlacerAdminContentOverrides } from "./admin-content/acton-academy-placer";

import type { SchoolAdminDemoConfig } from "./demo-dashboard-types";

export const actonAcademyPlacerAdminDemoConfig: SchoolAdminDemoConfig = {
  slug: "acton-academy-placer",
  logo: ACTON_ACADEMY_PLACER_ADMIN_LOGO,
  colors: ACTON_ACADEMY_PLACER_ADMIN_COLORS,
  compactRows: ACTON_ACADEMY_PLACER_ADMIN_COMPACT_ROWS,
  copy: {
    schoolName: "Acton Academy Placer",
    schoolShortName: "Acton Placer",
    officeName: "Acton Academy Placer Office",
    locationSubtitle:
      "Acton Academy Placer — Roseville, Sacramento & Rocklin · Ages 4–18",
  },
  contentOverrides: actonAcademyPlacerAdminContentOverrides,
};
