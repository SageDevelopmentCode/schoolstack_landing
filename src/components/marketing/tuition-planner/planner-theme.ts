import type { ParentThemeTokens } from "@/lib/organization-settings/parent-theme";
import { MARKETING_TOOL_BRIGHT_THEME } from "@/components/marketing/free-tools/free-tools-hub-theme";

/** Bright marketing palette for the public tuition planner */
export const TUITION_PLANNER_THEME: ParentThemeTokens = {
  ...MARKETING_TOOL_BRIGHT_THEME,
};

export const plannerFocusClass =
  "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-clay";
