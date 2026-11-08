import type { ParentThemeTokens } from "@/lib/organization-settings/parent-theme";

const INK = "#1d1a16";
const CLAY = "#A05C45";

/** Bright home-page marketing palette for book-a-demo and public flows. */
export const MUDKITCHEN_MARKETING_BRIGHT_THEME: ParentThemeTokens = {
  paper: "#FFFFFF",
  ink: INK,
  muted: "rgba(29, 26, 22, 0.6)",
  line: "rgba(0, 0, 0, 0.1)",
  cream: "#F7F5F2",
  white: "#FFFFFF",
  primary: INK,
  primaryDark: INK,
  primaryLight: "#F4F1EC",
  primarySoft: "rgba(29, 26, 22, 0.08)",
  sage: CLAY,
  sky: "#EAF1FD",
  sun: "#FFF4EC",
  coral: CLAY,
  berry: "#A9667C",
  success: "#4a7c59",
  successBg: "#E9F2E4",
  warning: "#986F14",
  warningBg: "#FFF4D9",
  alert: CLAY,
  alertBg: "#FBEDEB",
  info: INK,
  infoBg: "#F4F1EC",
  shadowCard: "0 24px 60px rgba(30, 60, 30, 0.08)",
  shadowPill: "0 2px 8px rgba(0, 0, 0, 0.06)",
  radiusCard: "28px",
  radiusButton: "9999px",
  fontDisplay: "var(--font-secondary)",
  fontBody: "var(--font-secondary)",
};
