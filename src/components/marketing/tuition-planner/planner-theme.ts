import type { ParentThemeTokens } from "@/lib/organization-settings/parent-theme";
import { MARKETING_TOOL_GARDEN_THEME } from "@/components/marketing/shared/marketing-tool-garden";

/** Garden marketing palette for the public tuition planner */
export const TUITION_PLANNER_THEME: ParentThemeTokens = {
  ...MARKETING_TOOL_GARDEN_THEME,
};

export const plannerFocusClass =
  "focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[var(--sf-clay)]/30";
