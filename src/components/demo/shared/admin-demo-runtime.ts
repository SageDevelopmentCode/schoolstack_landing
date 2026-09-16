import type {
  SchoolAdminDemoColors,
  SchoolAdminDemoConfig,
  SchoolAdminDemoCopy,
  SchoolAdminDemoLogo,
} from "@/data/school-demos/demo-dashboard-types";
import {
  buildDemoAdminCompat,
  buildDemoParentThemeTokens,
} from "@/components/demo/shared/demo-story-theme";
import type { ParentThemeTokens } from "@/lib/organization-settings/parent-theme";
import type { AdminThemeTokens } from "@/lib/organization-settings/theme";

export let ADMIN_DEMO_COLORS: SchoolAdminDemoColors = {
  bg: "#f7fafc",
  border: "#eeeeee",
  borderStrong: "#769a61",
  accent: "#769a61",
  accentBright: "#5f824f",
  accentLight: "rgba(118, 154, 97, 0.10)",
  secondaryBtnBorder: "rgba(118, 154, 97, 0.22)",
  accentGlow: "rgba(118, 154, 97, 0.12)",
  accentMid: "#644268",
  accentDark: "#1e141f",
  clay: "#efad1f",
  clayBg: "rgba(239, 173, 31, 0.12)",
  clayBorder: "rgba(239, 173, 31, 0.35)",
  textPrimary: "#1e141f",
  textSecondary: "#718096",
};

export let ADMIN_DEMO_COPY: SchoolAdminDemoCopy = {
  schoolName: "Luff Learning Fine Arts Academy",
  schoolShortName: "Luff Learning",
  officeName: "Luff Learning Office",
  locationSubtitle:
    "Luff Learning Fine Arts Academy — Spring, TX · 2026–27 Enrollment",
};

let adminLogo: SchoolAdminDemoLogo = {
  src: "/images/demo/lufflearning/LogoReverse_GreenHeart_1920x1080_Lufflearning.png",
  alt: "Luff Learning Fine Arts Academy",
  width: 220,
  height: 52,
};

let adminCompactRows = 5;

export let ADMIN_DEMO_STORY_THEME: ParentThemeTokens = buildDemoParentThemeTokens({
  accent: ADMIN_DEMO_COLORS.accent,
  accentHover: ADMIN_DEMO_COLORS.accentBright,
  accentLight: ADMIN_DEMO_COLORS.accentLight,
  accentDark: ADMIN_DEMO_COLORS.accentDark,
});

export let ADMIN_DEMO_STORY_COMPAT: AdminThemeTokens =
  buildDemoAdminCompat(ADMIN_DEMO_STORY_THEME);

export function getAdminDemoLogo(): SchoolAdminDemoLogo {
  return adminLogo;
}

export function getAdminCompactRows(): number {
  return adminCompactRows;
}

export function applyAdminDemoRuntime(config: SchoolAdminDemoConfig): void {
  ADMIN_DEMO_COLORS = config.colors;
  ADMIN_DEMO_COPY = config.copy;
  adminLogo = config.logo;
  adminCompactRows = config.compactRows;
  ADMIN_DEMO_STORY_THEME = buildDemoParentThemeTokens({
    accent: config.colors.accent,
    accentHover: config.colors.accentBright,
    accentLight: config.colors.accentLight,
    accentDark: config.colors.accentDark,
  });
  ADMIN_DEMO_STORY_COMPAT = buildDemoAdminCompat(ADMIN_DEMO_STORY_THEME);
}
