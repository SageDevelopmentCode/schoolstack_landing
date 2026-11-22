import type { ParentThemeTokens } from "@/lib/organization-settings/parent-theme";
import { MUDKITCHEN_MARKETING_GARDEN_THEME } from "@/lib/marketing/mudkitchen-garden-marketing-theme";

/**
 * MudKitchen's own Garden theme for the internal outreach workspace (/admin/research):
 * the marketing Garden palette with clay as the action colour, as on the home page.
 */
export const RESEARCH_GARDEN_THEME: ParentThemeTokens = {
  ...MUDKITCHEN_MARKETING_GARDEN_THEME,
  primary: "#A05C45",
  primaryDark: "#7E4533",
  primaryLight: "#F8DDCF",
  primarySoft: "rgba(160, 92, 69, 0.1)",
};
