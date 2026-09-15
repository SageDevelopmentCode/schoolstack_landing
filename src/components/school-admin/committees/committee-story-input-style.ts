import type { CSSProperties } from "react";
import type { ParentThemeTokens } from "@/lib/organization-settings/parent-theme";

export function committeeStoryInputStyle(theme: ParentThemeTokens): CSSProperties {
  return {
    borderColor: "#DCE4DC",
    backgroundColor: theme.white,
    color: theme.ink,
  };
}
