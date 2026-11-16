"use client";

import StoryToaster from "@/components/mudkitchen-portal/ui/StoryToaster";
import GardenToaster from "@/components/school-parent/garden/GardenToaster";
import type { AdminThemeTokens } from "@/lib/organization-settings/theme";
import type { ParentThemeTokens } from "@/lib/organization-settings/parent-theme";

type ParentToasterProps = {
  C: AdminThemeTokens;
  /** When the fixed help FAB is visible, lift toasts above it. */
  helpButtonVisible?: boolean;
  /**
   * "garden" = parent portal Garden toasts (needs `theme`). Teacher and the
   * apply portal keep the default story look.
   */
  appearance?: "story" | "garden";
  theme?: ParentThemeTokens;
};

export default function ParentToaster({
  C,
  helpButtonVisible = false,
  appearance = "story",
  theme,
}: ParentToasterProps) {
  const bottomOffset = helpButtonVisible ? 80 : 16;

  if (appearance === "garden" && theme) {
    return <GardenToaster theme={theme} bottomOffset={bottomOffset} />;
  }

  return <StoryToaster C={C} bottomOffset={bottomOffset} />;
}
