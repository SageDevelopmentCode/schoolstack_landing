import type { ParentThemeTokens } from "@/lib/organization-settings/parent-theme";

/** School Day Story palette from the tuition planner prototype. */
export const TUITION_PLANNER_THEME: ParentThemeTokens = {
  paper: "#F8F5ED",
  ink: "#283943",
  muted: "#65777F",
  line: "#E4E8E1",
  cream: "#FFFDF7",
  white: "#FFFFFF",
  primary: "#315E4F",
  primaryDark: "#203C32",
  primaryLight: "#CFE4D6",
  primarySoft: "#EAF2EB",
  sage: "#CFE4D6",
  sky: "#8EBDCB",
  sun: "#EFC56E",
  coral: "#DF8A72",
  berry: "#A9667C",
  success: "#34825A",
  successBg: "#EBF8EF",
  warning: "#986F14",
  warningBg: "#FFF4D9",
  alert: "#B5594A",
  alertBg: "#FBEDEB",
  info: "#39788C",
  infoBg: "#E9F4F7",
  shadowCard: "0 3px 10px rgba(50, 72, 61, 0.035)",
  shadowPill: "0 2px 8px rgba(50, 72, 61, 0.05)",
  radiusCard: "22px",
  radiusButton: "12px",
  fontDisplay: "var(--font-fraunces), Georgia, serif",
  fontBody: "var(--font-dm-sans), system-ui, sans-serif",
};

export const plannerFocusClass =
  "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#315E4F]";
