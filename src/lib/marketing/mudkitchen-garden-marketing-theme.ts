import type { ParentThemeTokens } from "@/lib/organization-settings/parent-theme";
import { MUDKITCHEN_MARKETING_BRIGHT_THEME } from "./mudkitchen-bright-marketing-theme";

const INK = "#2B241D";
const CLAY = "#A05C45";
const FOREST = "#2E4A3C";

/** Garden home-option palette for the embedded book-a-demo flow. */
export const MUDKITCHEN_MARKETING_GARDEN_THEME: ParentThemeTokens = {
  ...MUDKITCHEN_MARKETING_BRIGHT_THEME,
  paper: "#FFFDF8",
  ink: INK,
  muted: "rgba(43, 36, 29, 0.62)",
  line: "rgba(43, 36, 29, 0.12)",
  cream: "#F7F1E7",
  primary: FOREST,
  primaryDark: "#1F3329",
  primaryLight: "#DDEBD5",
  primarySoft: "rgba(46, 74, 60, 0.1)",
  sage: CLAY,
  sky: "#E3EDFB",
  sun: "#FFE58A",
  coral: CLAY,
  alert: CLAY,
  info: INK,
  infoBg: "#F7F1E7",
  shadowCard: "0 30px 60px -35px rgba(43, 36, 29, 0.5)",
  radiusCard: "28px",
  radiusButton: "9999px",
  fontDisplay: "var(--font-sf-display)",
  fontBody: "var(--font-sf-body)",
};
