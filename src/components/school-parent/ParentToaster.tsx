"use client";

import StoryToaster from "@/components/mudkitchen-portal/ui/StoryToaster";
import type { AdminThemeTokens } from "@/lib/organization-settings/theme";

type ParentToasterProps = {
  C: AdminThemeTokens;
  /** When the fixed help FAB is visible, lift toasts above it. */
  helpButtonVisible?: boolean;
};

export default function ParentToaster({
  C,
  helpButtonVisible = false,
}: ParentToasterProps) {
  const bottomOffset = helpButtonVisible ? 80 : 16;

  return <StoryToaster C={C} bottomOffset={bottomOffset} />;
}
