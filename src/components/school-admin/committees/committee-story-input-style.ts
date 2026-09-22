import type { CSSProperties } from "react";
import type { ParentThemeTokens } from "@/lib/organization-settings/parent-theme";

export const committeeStoryInputClassName =
  "w-full rounded-md border px-3 py-2 text-sm";

export function committeeStoryInputStyle(theme: ParentThemeTokens): CSSProperties {
  return {
    borderColor: "#DCE4DC",
    backgroundColor: theme.white,
    color: theme.ink,
  };
}
