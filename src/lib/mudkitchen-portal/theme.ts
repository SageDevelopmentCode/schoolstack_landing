import { phaseAccentByNumber } from "@/data/school-demos/rooted-meadows-timeline";

export const MUDKITCHEN_PORTAL_THEME = {
  pageBg: "#F7F1E7",
  surface: "#FFFAF4",
  border: "#DDD0BE",
  borderStrong: "#B8A898",
  accent: "#2E4A3C",
  accentHover: "#233B2F",
  accentSoft: "#E8F0EC",
  clay: "#A05C45",
  claySoft: "#E8D5C8",
  textPrimary: "#2B241D",
  textSecondary: "#6D6257",
  textFaint: "#B8A898",
  radiusSm: "10px",
  radiusMd: "14px",
  radiusLg: "20px",
} as const;

export type MudKitchenPortalTheme = typeof MUDKITCHEN_PORTAL_THEME;

export { phaseAccentByNumber };
