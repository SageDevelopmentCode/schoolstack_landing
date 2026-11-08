import type { DemoTheme } from "@/data/school-demos/types";
import { MUDKITCHEN_MARKETING_BRIGHT_THEME } from "@/lib/marketing/mudkitchen-bright-marketing-theme";
import type { ParentThemeTokens } from "@/lib/organization-settings/parent-theme";

/** Bright marketing tokens for concept-demo walkthrough chrome, tinted by school primary. */
export function buildSchoolConceptWalkthroughTheme(
  theme: DemoTheme,
): ParentThemeTokens {
  const accent = theme.primary;
  const accentHover = theme.primaryHover;
  const accentLight = theme.badgeBg ?? `color-mix(in srgb, ${accent} 12%, white)`;

  return {
    ...MUDKITCHEN_MARKETING_BRIGHT_THEME,
    primary: accent,
    primaryDark: theme.dark || accentHover,
    primaryLight: accentLight,
    primarySoft: `color-mix(in srgb, ${accent} 12%, transparent)`,
    paper: "#FFFFFF",
    white: "#FFFFFF",
  };
}
